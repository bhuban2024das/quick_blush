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
exports.ServiceAddon = void 0;
const typeorm_1 = require("typeorm");
const Service_1 = require("./Service");
let ServiceAddon = class ServiceAddon {
    id;
    service;
    name;
    price;
    isActive;
    createdAt;
    updatedAt;
};
exports.ServiceAddon = ServiceAddon;
__decorate([
    (0, typeorm_1.PrimaryColumn)("varchar", { length: 50 }),
    __metadata("design:type", String)
], ServiceAddon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Service_1.Service, { eager: false, onDelete: "CASCADE" }),
    __metadata("design:type", Service_1.Service)
], ServiceAddon.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], ServiceAddon.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServiceAddon.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], ServiceAddon.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceAddon.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceAddon.prototype, "updatedAt", void 0);
exports.ServiceAddon = ServiceAddon = __decorate([
    (0, typeorm_1.Entity)("service_addons")
], ServiceAddon);
