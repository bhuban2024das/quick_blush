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
exports.VendorSubscription = exports.SubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
const SubscriptionPlan_1 = require("./SubscriptionPlan");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["CANCELLED"] = "CANCELLED";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
let VendorSubscription = class VendorSubscription {
    id;
    vendor;
    plan;
    startDate;
    endDate;
    status;
    paymentCollected;
    createdAt;
    updatedAt;
};
exports.VendorSubscription = VendorSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VendorSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorSubscription.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubscriptionPlan_1.SubscriptionPlan, { eager: true, onDelete: "RESTRICT" }),
    __metadata("design:type", SubscriptionPlan_1.SubscriptionPlan)
], VendorSubscription.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE }),
    __metadata("design:type", String)
], VendorSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], VendorSubscription.prototype, "paymentCollected", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorSubscription.prototype, "updatedAt", void 0);
exports.VendorSubscription = VendorSubscription = __decorate([
    (0, typeorm_1.Entity)("vendor_subscriptions")
], VendorSubscription);
