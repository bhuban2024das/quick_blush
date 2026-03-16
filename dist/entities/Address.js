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
exports.Address = exports.AddressType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var AddressType;
(function (AddressType) {
    AddressType["HOME"] = "HOME";
    AddressType["WORK"] = "WORK";
    AddressType["OTHER"] = "OTHER";
})(AddressType || (exports.AddressType = AddressType = {}));
let Address = class Address {
    id;
    user;
    type;
    street;
    city;
    state;
    zipCode;
    landmark;
    isDefault;
    // Optional GPS coordinates
    lat;
    lng;
    createdAt;
    updatedAt;
};
exports.Address = Address;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Address.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.id, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Address.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: AddressType, default: AddressType.HOME }),
    __metadata("design:type", String)
], Address.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Address.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Address.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Address.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "landmark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Address.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Address.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Address.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Address.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Address.prototype, "updatedAt", void 0);
exports.Address = Address = __decorate([
    (0, typeorm_1.Entity)("addresses")
], Address);
