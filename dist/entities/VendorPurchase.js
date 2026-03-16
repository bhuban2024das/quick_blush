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
exports.VendorPurchase = exports.PurchaseStatus = exports.PurchasePaymentMode = void 0;
const typeorm_1 = require("typeorm");
const Vendor_1 = require("./Vendor");
const ProductKit_1 = require("./ProductKit");
var PurchasePaymentMode;
(function (PurchasePaymentMode) {
    PurchasePaymentMode["PAY_NOW"] = "PAY_NOW";
    PurchasePaymentMode["DEDUCT_FROM_PAYOUT"] = "DEDUCT_FROM_PAYOUT";
})(PurchasePaymentMode || (exports.PurchasePaymentMode = PurchasePaymentMode = {}));
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["PENDING"] = "PENDING";
    PurchaseStatus["PAID"] = "PAID";
    PurchaseStatus["CANCELLED"] = "CANCELLED";
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
let VendorPurchase = class VendorPurchase {
    id;
    vendor;
    kit;
    quantity;
    totalAmount;
    paymentMode;
    status;
    invoiceUrl;
    createdAt;
    updatedAt;
};
exports.VendorPurchase = VendorPurchase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VendorPurchase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", Vendor_1.Vendor)
], VendorPurchase.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductKit_1.ProductKit, { eager: true, onDelete: "RESTRICT" }),
    __metadata("design:type", ProductKit_1.ProductKit)
], VendorPurchase.prototype, "kit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], VendorPurchase.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VendorPurchase.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: PurchasePaymentMode }),
    __metadata("design:type", String)
], VendorPurchase.prototype, "paymentMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: PurchaseStatus, default: PurchaseStatus.PENDING }),
    __metadata("design:type", String)
], VendorPurchase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], VendorPurchase.prototype, "invoiceUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VendorPurchase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VendorPurchase.prototype, "updatedAt", void 0);
exports.VendorPurchase = VendorPurchase = __decorate([
    (0, typeorm_1.Entity)("vendor_purchases")
], VendorPurchase);
