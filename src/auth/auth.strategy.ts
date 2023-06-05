import { Injectable, CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get("JWT_SECRET")
        })
    }
    async validate(payload) {
        return payload
    }
}

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly jwtService: JwtService;
    constructor(
        private readonly roles:number[]
    ) {this.jwtService = new JwtService}
    async canActivate(context: ExecutionContext) {
        const jwtToken = context.switchToHttp().getRequest()['headers']['authorization'].substring(7)
        const role = await this.jwtService.decode(jwtToken)['role']
        if (this.roles.includes(role)) return true
        else return false
  }
}