import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Service } from "./Service";

@Entity("service_addons")
export class ServiceAddon {
    @PrimaryColumn("varchar", { length: 50 })
    id!: string;

    @ManyToOne(() => Service, { eager: false, onDelete: "CASCADE" })
    service!: Service;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price!: number;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
