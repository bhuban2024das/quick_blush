import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("service_categories")
export class ServiceCategory {
    @PrimaryColumn("varchar", { length: 50 })
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string;

    @Column({ type: "varchar", nullable: true })
    imageUrl!: string;

    @ManyToOne(() => ServiceCategory, category => category.subCategories, { nullable: true, onDelete: "CASCADE" })
    parentCategory!: ServiceCategory;

    @OneToMany(() => ServiceCategory, category => category.parentCategory)
    subCategories!: ServiceCategory[];

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
