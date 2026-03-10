import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Vendor } from "./Vendor";

export enum TicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}

export enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}

@Entity("support_tickets")
export class SupportTicket {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    user!: User;

    @ManyToOne(() => Vendor, { nullable: true, onDelete: "SET NULL" })
    vendor!: Vendor;

    @Column({ type: "varchar", length: 255 })
    subject!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "enum", enum: TicketStatus, default: TicketStatus.OPEN })
    status!: TicketStatus;

    @Column({ type: "enum", enum: TicketPriority, default: TicketPriority.MEDIUM })
    priority!: TicketPriority;

    @Column({ type: "jsonb", nullable: true })
    attachments!: any[]; // e.g. ["url1", "url2"]

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
