import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("admins")
export class Admin {
    @PrimaryGeneratedColumn("uuid")
    id !: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "varchar" })
    passwordHash!: string; // Hashed password

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
