import * as Layer from '@effect/io/Layer';
import * as Effect from '@effect/io/Effect';
import * as Context from '@effect/data/Context';
import type { NotAnyType } from 'type-plus';
import { pipe } from '@effect/data/Function';

// This is work.
effect({
  effect: {
    layers: [Layer.succeed(Dice, Dice.of({ roll: () => Effect.succeed(6) }))],
  },
  resolve() {
    return pipe(
      Dice,
      Effect.flatMap((dice) => dice.roll())
    );
  },
});

// This is works too.
effect({
  effect: {
    layers: [Layer.succeed(Dice, Dice.of({ roll: () => Effect.succeed(6) }))],
  },
  resolve: function () {
    return pipe(
      Dice,
      Effect.flatMap((dice) => dice.roll())
    );
  },
});

effect({
  effect: {
    layers: [Layer.succeed(Dice, Dice.of({ roll: () => Effect.succeed(6) }))],
  },
  // @effect/io^0.32
  resolve: () => {
    return pipe(
      Dice,
      Effect.flatMap((dice) => dice.roll())
    );
  },
});

type WithContext<T> = ((context: any) => T) | T;

type UnboxWithContext<T> = T extends (context: any) => infer U ? U : T;

type MyLayer = WithContext<Layer.Layer<any, any, any>>;

type MyContext = WithContext<Context.Context<any>>;

declare namespace Infer {
  export type Context<T> = T extends Context.Context<infer U> ? U : never;
  export type Layer<T> = T extends Layer.Layer<any, any, infer U> ? U : never;
}

type GetEffectRequirementsFromLayers<Layers extends readonly [...MyLayer[]]> =
  NotAnyType<
    keyof { [K in Layers[number] as Infer.Layer<UnboxWithContext<K>>]: true }
  >;

type GetEffectRequirementsFromContexts<
  Contexts extends readonly [...MyContext[]]
> = NotAnyType<
  keyof { [K in Contexts[number] as Infer.Context<UnboxWithContext<K>>]: true }
>;

type GetEffectRequirements<
  Contexts extends readonly [...MyContext[]],
  Layers extends readonly [...MyLayer[]]
> =
  | GetEffectRequirementsFromLayers<Layers>
  | GetEffectRequirementsFromContexts<Contexts>;

export type FieldOptions<
  ContextsShape extends readonly [...MyContext[]],
  LayersShape extends readonly [...MyLayer[]]
> = {
  effect?: {
    contexts?: ContextsShape;
    layers?: LayersShape;
  };
  resolve(): Effect.Effect<
    GetEffectRequirements<ContextsShape, LayersShape>,
    never,
    number
  >;
};

function effect<
  ContextsShape extends readonly [...MyContext[]],
  LayersShape extends readonly [...MyLayer[]]
>(options: FieldOptions<ContextsShape, LayersShape>) {}

interface Dice {
  readonly roll: () => Effect.Effect<never, never, number>;
}

declare const Dice: Context.Tag<Dice, Dice>;
