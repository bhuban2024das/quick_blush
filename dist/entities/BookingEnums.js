"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["VENDOR_ASSIGNED"] = "VENDOR_ASSIGNED";
    BookingStatus["VENDOR_ENROUTE"] = "VENDOR_ENROUTE";
    BookingStatus["ARRIVED"] = "ARRIVED";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["SERVICE_ENDED"] = "SERVICE_ENDED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PAY_AFTER_SERVICE"] = "PAY_AFTER_SERVICE";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
