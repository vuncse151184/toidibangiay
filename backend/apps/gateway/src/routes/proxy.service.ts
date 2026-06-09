import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Request, Response } from 'express';

type ProxyOptions = {
  baseUrl: string;
  path: string;
  body?: unknown;
};

@Injectable()
export class ProxyService {
  async forward(req: Request, res: Response, options: ProxyOptions) {
    const url = new URL(`${options.baseUrl}${options.path}`);
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
      } else if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers: this.forwardHeaders(req),
      body: this.hasBody(req.method) ? JSON.stringify(options.body ?? {}) : undefined,
    }).catch((error) => {
      throw new ServiceUnavailableException(error instanceof Error ? error.message : 'Service unavailable');
    });

    this.copyHeaders(response, res);
    res.status(response.status);

    const text = await response.text();
    if (!text) {
      return res.send();
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return res.send(JSON.parse(text));
    }

    return res.send(text);
  }

  async request<T>(options: {
    baseUrl: string;
    path: string;
    method?: string;
    body?: unknown;
    authorization?: string;
    cookie?: string;
  }): Promise<T> {
    const response = await fetch(`${options.baseUrl}${options.path}`, {
      method: options.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(options.authorization ? { authorization: options.authorization } : {}),
        ...(options.cookie ? { cookie: options.cookie } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = data?.message ?? data?.error ?? `Request failed with ${response.status}`;
      throw new ServiceUnavailableException(message);
    }

    return data as T;
  }

  private hasBody(method: string) {
    return !['GET', 'HEAD'].includes(method.toUpperCase());
  }

  private forwardHeaders(req: Request) {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };

    if (req.headers.authorization) headers.authorization = req.headers.authorization;
    if (req.headers.cookie) headers.cookie = req.headers.cookie;
    if (req.headers['x-session-id']) headers['x-session-id'] = req.headers['x-session-id'] as string;

    return headers;
  }

  private copyHeaders(response: globalThis.Response, res: Response) {
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.setHeader('set-cookie', setCookie);

    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
  }
}
