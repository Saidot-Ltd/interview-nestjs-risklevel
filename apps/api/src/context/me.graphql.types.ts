import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Me {
    @Field(() => Int)
    id: number;

    @Field()
    email: string;

    @Field(() => Int)
    organizationId: number;
}
