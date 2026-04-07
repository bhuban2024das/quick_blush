import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { ServiceCategory } from "./ServiceCategory";
import { Service } from "./Service";

export enum VendorStatus {
    PENDING = "PENDING",    // Awaiting approval
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}

export enum VendorLevel {
    SILVER = "SILVER",
    GOLD = "GOLD",
    PLATINUM = "PLATINUM"
}

@Entity("vendors")
export class Vendor {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 20, unique: true })
    mobile!: string;

    @Column({ type: "varchar", length: 150, unique: true, nullable: true })
    email!: string;

    @Column({ type: "text", nullable: true })
    address!: string;

    @Column({ type: "int", nullable: true })
    age?: number;

    @Column({ type: "varchar", nullable: true })
    photo!: string;

    @Column({ type: "int", default: 0 })
    experienceYears!: number;

    @Column({ type: "enum", enum: VendorStatus, default: VendorStatus.PENDING })
    status!: VendorStatus;

    @Column({ type: "enum", enum: VendorLevel, default: VendorLevel.SILVER })
    level!: VendorLevel;

    @Column({ type: "float", default: 0 })
    rating!: number;

    @Column({ type: "int", default: 0 })
    consecutiveRejections!: number;

    @Column({ type: "boolean", default: true })
    isOnline!: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    walletBalance!: number;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    @ManyToMany(() => ServiceCategory)
    @JoinTable({
        name: "vendor_service_categories",
        joinColumn: { name: "vendor_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "category_id", referencedColumnName: "id" }
    })
    serviceCategories!: ServiceCategory[];

    @ManyToMany(() => Service)
    @JoinTable({
        name: "vendor_services",
        joinColumn: { name: "vendor_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "service_id", referencedColumnName: "id" }
    })
    services!: Service[];

    // Geolocation - For spatial queries we'd use PostGIS 'geometry' type
    @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326, nullable: true })
    location!: string;

    @Column({ type: "varchar", nullable: true })
    documentUrl?: string;

    @Column({ type: "boolean", default: false })
    isVerified!: boolean;

    @Column({ type: "text", nullable: true })
    refreshToken!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "varchar", length: 500, nullable: true })
    fcmToken?: string;
}
