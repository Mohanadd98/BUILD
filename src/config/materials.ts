/**
 * BinaaHub material settings, Egypt edition.
 *
 * EVERY mix ratio, coverage value and default used by the calculators lives
 * in this file. Edit a number here and every calculator updates.
 *
 * How to read the source notes:
 *   SOURCE  where the value comes from.
 *   STATUS  "Code"      = taken from a building code clause you can cite.
 *           "Practice"  = common Egyptian site / bill of quantities practice.
 *                         Widely used, but NOT a code clause. Check it against
 *                         the project specification before relying on it.
 *           "Product"   = depends on the product; replace with the value on
 *                         the manufacturer's Technical Data Sheet (TDS).
 *           "Geometry"  = pure arithmetic, no material assumption.
 *
 * Units: metres, square metres, cubic metres, kilograms, litres.
 */

export const MATERIALS = {
  /**
   * Mass of one bag of cement.
   * SOURCE: Egyptian market standard bag size, confirmed by project owner.
   * STATUS: Practice.
   */
  cementBagKg: 50,

  concrete: {
    /**
     * Quantities per 1 m³ of finished (compacted) concrete.
     * Egyptian practice specifies concrete by cement content (kg per m³)
     * with fixed volumes of sand and gravel, not by a volume ratio like 1:2:4.
     *
     * SOURCE: common Egyptian bill of quantities practice
     *   plain concrete       250 kg cement + 0.4 m³ sand + 0.8 m³ gravel
     *   reinforced concrete  350 kg cement + 0.4 m³ sand + 0.8 m³ gravel
     * STATUS: Practice. ECP 203 (Egyptian Code for Design and Construction of
     *   Concrete Structures, Housing and Building National Research Center,
     *   Cairo) sets the MINIMUM cement content and strength requirements.
     *   The exact clause and table were not verified for this file; confirm
     *   them in the current ECP 203 edition before citing in academic work.
     */
    mixes: {
      plain: { cementKgPerM3: 250, sandM3PerM3: 0.4, gravelM3PerM3: 0.8 },
      reinforced: { cementKgPerM3: 350, sandM3PerM3: 0.4, gravelM3PerM3: 0.8 },
    },
    /**
     * Extra volume ordered to cover spillage, formwork bulging and uneven
     * ground.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    defaultWastePercent: 5,
  },

  masonry: {
    /**
     * Block sizes in cm (length × width × height), as laid.
     * `fullBrickWall: true` means the unit can also build a "one brick" wall
     * (thickness = two leaves + one joint, e.g. 12 + 1 + 12 = 25 cm).
     *
     * SOURCE: common Egyptian market sizes for red clay brick, cement brick
     *   and hollow concrete block.
     * STATUS: Practice. Sizes vary by factory; measure a sample or use the
     *   supplier's sheet and edit these numbers.
     */
    blocks: {
      redBrick: { lengthCm: 25, widthCm: 12, heightCm: 6, fullBrickWall: true },
      cementBrick: { lengthCm: 25, widthCm: 12, heightCm: 6, fullBrickWall: true },
      hollowBlock: { lengthCm: 40, widthCm: 20, heightCm: 20, fullBrickWall: false },
    },
    /**
     * Mortar joint thickness, bed and head joints.
     * SOURCE: common site practice of 10 mm. EN 1996-1-1 (Eurocode 6) allows
     *   6 to 15 mm for general purpose mortar joints; confirm the clause in
     *   the edition you cite.
     * STATUS: Practice.
     */
    jointCm: 1,
    /**
     * Masonry mortar per 1 m³ of wet mortar: 1 m³ sand + 250 kg cement.
     * The cement fills the voids in the sand, so the sand volume is taken
     * equal to the mortar volume.
     * SOURCE: common Egyptian bill of quantities practice.
     * STATUS: Practice. Check against the project specification.
     */
    mortar: { cementKgPerM3: 250, sandM3PerM3: 1.0 },
    /**
     * Breakage and cutting allowance on blocks.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    defaultBlockWastePercent: 5,
    /**
     * Extra mortar for droppings, filling frogs and uneven joints.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    mortarWastePercent: 10,
  },

  plaster: {
    /**
     * Default total plaster thickness (the user can change it on screen).
     * SOURCE: common Egyptian site practice, about 2 cm inside and 2.5 cm
     *   outside, where walls are more uneven and weather exposed.
     * STATUS: Practice. Check against the project specification.
     */
    thicknessCm: { internal: 2, external: 2.5 },
    /**
     * Cement-sand plaster per 1 m³ of wet mortar: 1 m³ sand + 300 kg cement.
     * Sand volume is taken equal to the mortar volume (cement fills voids).
     * SOURCE: common Egyptian bill of quantities practice.
     * STATUS: Practice. Check against the project specification.
     */
    mortar: { cementKgPerM3: 300, sandM3PerM3: 1.0 },
    /**
     * Spatter coat (طرطشة): a thin, cement rich first coat thrown onto the
     * wall so the plaster bonds. Calculated separately and added to the totals.
     * SOURCE: common site practice of about 5 mm with a rich mix of roughly
     *   450 kg cement per 1 m³ of sand.
     * STATUS: Practice, NOT verified against a written Egyptian source.
     *   Replace with your project specification values before relying on it.
     */
    spatter: { thicknessCm: 0.5, cementKgPerM3: 450, sandM3PerM3: 1.0 },
    /**
     * Extra mortar for droppings and filling uneven walls.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    defaultWastePercent: 10,
  },
} as const;

export type MaterialSettings = typeof MATERIALS;
