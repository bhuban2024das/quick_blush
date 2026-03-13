"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = exports.ReferralStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "PENDING";
    ReferralStatus["COMPLETED"] = "COMPLETED"; // User completed first booking, reward given
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
let Referral = class Referral {
    id;
    // User who shared the code
    referrer;
    // User who signed up using the code
    referred;
    referralCode;
    rewardAmount;
    status;
    createdAt;
    updatedAt;
};
exports.Referral = Referral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Referral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Referral.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Referral.prototype, "referred", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Referral.prototype, "referralCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Referral.prototype, "rewardAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ReferralStatus, default: ReferralStatus.PENDING }),
    __metadata("design:type", String)
], Referral.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "updatedAt", void 0);
exports.Referral = Referral = __decorate([
    (0, typeorm_1.Entity)("referrals")
], Referral);
