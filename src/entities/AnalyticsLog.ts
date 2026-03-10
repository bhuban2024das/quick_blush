import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("analytics_logs")
export class AnalyticsLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 100 })
    eventName!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    actorId!: string; // userId, vendorId, adminId, etc.

    @Column({ type: "varchar", length: 50, nullable: true })
    actorType!: string; // USER, VENDOR, SYSTEM, etc.

    @Column({ type: "jsonb", nullable: true })
    data!: any;

    @CreateDateColumn()
    createdAt!: Date;
}
