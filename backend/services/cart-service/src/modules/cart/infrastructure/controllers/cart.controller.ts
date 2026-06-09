import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard, AuthenticatedUser } from '../../../../shared/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../shared/guards/optional-jwt-auth.guard';
import { AddItemDto } from '../../application/dto/add-item.dto';
import { UpdateItemDto } from '../../application/dto/update-item.dto';
import { AddItemUseCase } from '../../application/use-cases/add-item.use-case';
import { ClearCartUseCase } from '../../application/use-cases/clear-cart.use-case';
import { GetCartUseCase } from '../../application/use-cases/get-cart.use-case';
import { MergeCartUseCase } from '../../application/use-cases/merge-cart.use-case';
import { RemoveItemUseCase } from '../../application/use-cases/remove-item.use-case';
import { UpdateItemUseCase } from '../../application/use-cases/update-item.use-case';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addItemUseCase: AddItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly removeItemUseCase: RemoveItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly mergeCartUseCase: MergeCartUseCase,
  ) {}

  private resolveCartKey(
    user: AuthenticatedUser | undefined,
    sessionId: string | undefined,
  ): string {
    if (user) return user.userId;
    if (sessionId) return `guest_${sessionId}`;
    throw new UnauthorizedException('Either authorization token or x-session-id header is required');
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy giỏ hàng hiện tại' })
  getCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
  ) {
    const cartKey = this.resolveCartKey(user, sessionId);
    return this.getCartUseCase.execute(cartKey);
  }

  @Post('items')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  addItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
    @Body() dto: AddItemDto,
  ) {
    const cartKey = this.resolveCartKey(user, sessionId);
    return this.addItemUseCase.execute(cartKey, dto);
  }

  @Patch('items/:variantId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ' })
  updateItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateItemDto,
  ) {
    const cartKey = this.resolveCartKey(user, sessionId);
    return this.updateItemUseCase.execute(cartKey, variantId, dto);
  }

  @Delete('items/:variantId')
  @HttpCode(200)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  removeItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
    @Param('variantId') variantId: string,
  ) {
    const cartKey = this.resolveCartKey(user, sessionId);
    return this.removeItemUseCase.execute(cartKey, variantId);
  }

  @Delete()
  @HttpCode(200)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  clearCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
  ) {
    const cartKey = this.resolveCartKey(user, sessionId);
    return this.clearCartUseCase.execute(cartKey);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Merge guest cart vào user cart sau khi đăng nhập' })
  mergeCart(
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.mergeCartUseCase.execute(user.userId, sessionId);
  }
}
