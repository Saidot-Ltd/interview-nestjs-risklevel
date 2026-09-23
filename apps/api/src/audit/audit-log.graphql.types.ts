import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuditEntry {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    actorId: number;

    @Field()
    actorEmail: string;

    @Field()
    before: string;

    @Field()
    after: string;

    @Field()
    createdAt: string;
}

@ObjectType()
export class NotificationEntry {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    recipientId: number;

    @Field()
    message: string;

    @Field()
    createdAt: string;
}

@ObjectType()
export class SystemActivity {
    @Field(() => [AuditEntry])
    auditLog: AuditEntry[];

    @Field(() => [NotificationEntry])
    notifications: NotificationEntry[];
}
