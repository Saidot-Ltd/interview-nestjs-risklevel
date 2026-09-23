import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GovernSystemPayload {
    @Field(() => Int)
    id: number;

    @Field()
    name: string;

    @Field()
    riskLevel: string;

    @Field()
    riskLabel: string;

    @Field(() => Int)
    organizationId: number;

    @Field(() => Int)
    ownerId: number;

    @Field()
    ownerEmail: string;

    @Field(() => Int)
    version: number;
}

@ObjectType()
export class GovernSystemPage {
    @Field(() => [GovernSystemPayload])
    items: GovernSystemPayload[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pageSize: number;
}

export interface RiskLevelChangedEvent {
    systemId: number;
    organizationId: number;
    from: string;
    to: string;
    ownerId: number;
}

export const RISK_LEVEL_CHANGED = 'system.riskLevel.changed';
