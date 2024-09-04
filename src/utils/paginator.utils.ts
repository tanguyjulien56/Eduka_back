import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PaginatorUtils {
  validate(skip: string, take: string) {
    const skipInt = parseInt(skip, 10);
    const takeInt = parseInt(take, 10);
    if (isNaN(skipInt) || isNaN(takeInt) || skipInt < 0 || takeInt <= 0) {
      throw new BadRequestException('Invalid skip or take values');
    }
    return { skip: skipInt, take: takeInt };
  }
}
