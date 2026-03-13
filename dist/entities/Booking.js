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
exports.Booking = exports.PaymentStatus = exports.BookingStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Vendor_1 = require("./Vendor");
const Service_1 = require("./Service");
const BookingAddon_1 = require("./BookingAddon");
const BookingTimeline_1 = require("./BookingTimeline");
const BookingEnums_1 = require("./BookingEnums");
Object.defineProperty(exports, "BookingStatus", { enumerable: true, get: function () { return BookingEnums_1.BookingStatus; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return BookingEnums_1.PaymentStatus; } });
let Booking = class Booking {
    id;
    user;
    vendor;
    service;
    scheduledDate;
    scheduledTime;
    status;
    paymentStatus;
    totalAmount;
    tipAmount;
    lat;
    lng;
    address;
    customerNotes;
    addons;
    timeline;
    createdAt;
    updatedAt;
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Booking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { eager: true, nullable: true, onDelete: "SET NULL" }),
    __metadata("design:type", Object)
], Booking.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Service_1.Service, { eager: true, nullable: true }),
    __metadata("design:type", Service_1.Service)
], Booking.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Booking.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], Booking.prototype, "scheduledTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: BookingEnums_1.BookingStatus, default: BookingEnums_1.BookingStatus.PENDING_PAYMENT }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: BookingEnums_1.PaymentStatus, default: BookingEnums_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Booking.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "tipAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Booking.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "customerNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BookingAddon_1.BookingAddon, addon => addon.booking, { cascade: true }),
    __metadata("design:type", Array)
], Booking.prototype, "addons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BookingTimeline_1.BookingTimeline, timeline => timeline.booking, { cascade: true }),
    __metadata("design:type", Array)
], Booking.prototype, "timeline", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Booking.prototype, "updatedAt", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)("bookings")
], Booking);
