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
exports.Vendor = exports.VendorLevel = exports.VendorStatus = void 0;
const typeorm_1 = require("typeorm");
const ServiceCategory_1 = require("./ServiceCategory");
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["PENDING"] = "PENDING";
    VendorStatus["APPROVED"] = "APPROVED";
    VendorStatus["REJECTED"] = "REJECTED";
    VendorStatus["SUSPENDED"] = "SUSPENDED";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
var VendorLevel;
(function (VendorLevel) {
    VendorLevel["SILVER"] = "SILVER";
    VendorLevel["GOLD"] = "GOLD";
    VendorLevel["PLATINUM"] = "PLATINUM";
})(VendorLevel || (exports.VendorLevel = VendorLevel = {}));
let Vendor = class Vendor {
    id;
    name;
    mobile;
    email;
    address;
    age;
    photo;
    experienceYears;
    status;
    level;
    rating;
    consecutiveRejections;
    isOnline;
    walletBalance;
    password;
    serviceCategories;
    // Geolocation - For spatial queries we'd use PostGIS 'geometry' type
    location;
    createdAt;
    updatedAt;
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Vendor.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, unique: true }),
    __metadata("design:type", String)
], Vendor.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 150, unique: true, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Vendor.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "photo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "experienceYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: VendorStatus, default: VendorStatus.PENDING }),
    __metadata("design:type", String)
], Vendor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: VendorLevel, default: VendorLevel.SILVER }),
    __metadata("design:type", String)
], Vendor.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "consecutiveRejections", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isOnline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "walletBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Vendor.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ServiceCategory_1.ServiceCategory),
    (0, typeorm_1.JoinTable)({
        name: "vendor_service_categories",
        joinColumn: { name: "vendor_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Vendor.prototype, "serviceCategories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "geometry", spatialFeatureType: "Point", srid: 4326, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)("vendors")
], Vendor);
