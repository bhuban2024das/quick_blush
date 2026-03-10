import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ServiceCategory } from "./ServiceCategory";

@Entity("services")
export class Service {
    @PrimaryColumn("varchar", { length: 50 })
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @ManyToOne(() => ServiceCategory, { eager: true, onDelete: "CASCADE" })
    category!: ServiceCategory;

    // Pricing base on vendor level (Silver, Gold, Platinum)
    @Column({ type: "decimal", precision: 10, scale: 2 })
    silverPrice!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    goldPrice!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    platinumPrice!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    productCost!: number;

    @Column({ type: "int" })
    durationMinutes!: number;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
