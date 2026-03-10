import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum AddressType {
    HOME = "HOME",
    WORK = "WORK",
    OTHER = "OTHER"
}

@Entity("addresses")
export class Address {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, user => user.id, { onDelete: "CASCADE" })
    user!: User;

    @Column({ type: "enum", enum: AddressType, default: AddressType.HOME })
    type!: AddressType;

    @Column({ type: "varchar", length: 255 })
    street!: string;

    @Column({ type: "varchar", length: 100 })
    city!: string;

    @Column({ type: "varchar", length: 100 })
    state!: string;

    @Column({ type: "varchar", length: 20 })
    zipCode!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    landmark!: string;

    @Column({ type: "boolean", default: false })
    isDefault!: boolean;

    // Optional GPS coordinates
    @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
    lat!: number;

    @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
    lng!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
