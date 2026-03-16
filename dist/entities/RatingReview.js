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
exports.RatingReview = exports.ReviewType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Vendor_1 = require("./Vendor");
const Booking_1 = require("./Booking");
const Service_1 = require("./Service");
var ReviewType;
(function (ReviewType) {
    ReviewType["USER_TO_VENDOR"] = "USER_TO_VENDOR";
    ReviewType["VENDOR_TO_USER"] = "VENDOR_TO_USER";
})(ReviewType || (exports.ReviewType = ReviewType = {}));
let RatingReview = class RatingReview {
    id;
    booking;
    reviewType;
    user;
    vendor;
    service;
    rating; // 1 to 5 scale
    comment;
    createdAt;
};
exports.RatingReview = RatingReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], RatingReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Booking_1.Booking, { onDelete: "CASCADE" }),
    __metadata("design:type", Booking_1.Booking)
], RatingReview.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ReviewType }),
    __metadata("design:type", String)
], RatingReview.prototype, "reviewType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], RatingReview.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor, { onDelete: "CASCADE" }),
    __metadata("design:type", Vendor_1.Vendor)
], RatingReview.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Service_1.Service, { nullable: true, onDelete: "SET NULL" }),
    __metadata("design:type", Service_1.Service)
], RatingReview.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], RatingReview.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], RatingReview.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RatingReview.prototype, "createdAt", void 0);
exports.RatingReview = RatingReview = __decorate([
    (0, typeorm_1.Entity)("ratings_reviews")
], RatingReview);
