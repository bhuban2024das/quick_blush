import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    name!: string;

    @Column({ type: "varchar", length: 20, unique: true })
    mobile!: string;

    @Column({ type: "varchar", length: 150, unique: true, nullable: true })
    email!: string;

    @Column({ type: "varchar", nullable: true })
    password!: string;

    @Column({ type: "varchar", nullable: true })
    gender!: string;

    @Column({ type: "varchar", nullable: true })
    photo!: string;

    @Column({ type: "boolean", default: false })
    isVerified!: boolean;

    @Column({ type: "text", nullable: true })
    refreshToken!: string;

    @Column({ type: "jsonb", nullable: true })
    addressBook!: any; // e.g. [{ address: '...', pincode: '...' }]

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    walletBalance!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
