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
   * STATUS: Practice. ECP 203-2025 clause 2-2-1 (p. 2-1) requires CEM I to
   *   ES 4756-1 but does not specify a bag mass.
   */
  cementBagKg: 50,

  concrete: {
    /**
     * Quantities per 1 m³ of finished (compacted) concrete.
     * Egyptian practice specifies concrete by cement content (kg per m³)
     * with fixed volumes of sand and gravel, not by a volume ratio like 1:2:4.
     *
     * Reference: Housing and Building National Research Center (HBRC),
     *   Egyptian Code for Design and Construction of Concrete Structures,
     *   ECP 203-2025 (sixth update), Ministerial Decree No. 894 of 2025, Cairo.
     *
     * Reinforced concrete, by exposure (ECP 203-2025 Table 2-21, p. 2-32,
     * carbonation exposure). minFcu in N/mm², maxWc = maximum water/cement.
     *   dry      325 kg/m³, w/c <= 0.60, fcu >= 25: dry (30 to 50 % RH) or
     *            permanently wet; elements inside buildings with low humidity.
     *   normal   350 kg/m³, w/c <= 0.50, fcu >= 30: moderate humidity (50 to
     *            70 % RH); also nearly always wet, rarely dry elements in
     *            contact with water such as foundations (w/c <= 0.55).
     *   wetDry   375 kg/m³, w/c <= 0.45, fcu >= 35: repeated wetting and drying.
     *   STATUS: Code (minimum values).
     *
     * Reinforced concrete exposed to chlorides (ECP 203-2025 Table 2-22,
     * p. 2-33; clause 2-3-4-2-11, p. 2-31):
     *   chlorideModerate  350 kg/m³, w/c <= 0.50, fcu >= 30: moderate
     *                     humidity with airborne chlorides.
     *   chlorideWet       375 kg/m³, w/c <= 0.45, fcu >= 35: nearly always
     *                     wet, rarely dry, with chlorides (swimming pools,
     *                     elements exposed to industrial waste).
     *   chlorideWetDry    400 kg/m³, w/c <= 0.40, fcu >= 40: wetting and
     *                     drying with chlorides (bridges sprayed with
     *                     chloride water, pavements, car park slabs).
     *   Values are for CEM I. With CEM III/A or CEM III/B the footnote to
     *   Table 2-22 allows fcu 2.5 N/mm² lower, cement content 25 kg/m³ lower
     *   and w/c 0.05 higher, with the same concrete cover; see
     *   `cemIIIReduction` below. Tables 2-21 and 2-23 have no such note.
     *
     * Reinforced concrete exposed to seawater or combined attack (ECP
     * 203-2025 Table 2-23, p. 2-34; clause 2-3-4-2-12, p. 2-33):
     *   seaAir      375 kg/m³, w/c <= 0.45, fcu >= 35: salt-laden air.
     *   seaPrecast  375 kg/m³, w/c <= 0.45, fcu >= 40: continuously
     *               submerged in seawater, precast.
     *   seaInSitu   400 kg/m³, w/c <= 0.45, fcu >= 40: continuously
     *               submerged in seawater, cast in situ.
     *   seaTidal    425 kg/m³, w/c <= 0.40, fcu >= 45: tidal and wave
     *               splash zones.
     *
     * `zone` groups the types on screen; it is not a code value.
     *
     * plain cementKgPerM3 = 250
     *   STATUS: Practice. ECP 203-2025 gives no cement content for plain
     *   concrete; clause 2-3-2-1 (p. 2-21) only requires fcu >= 15 N/mm² for
     *   plain structural concrete (20 for reinforced).
     *
     * sandM3PerM3 = 0.4, gravelM3PerM3 = 0.8
     *   STATUS: Practice (estimate). ECP 203-2025 clause 2-4 (pp. 2-42 to 2-45)
     *   gives no fixed aggregate quantities: proportions must come from a mix
     *   design proven by laboratory trial mixes (clause 2-4-3-1) for a target
     *   mean strength fm = fcu + M (Eq. 2-11, Table 2-30).
     *
     * Upper limit: no mix may exceed 450 kg/m³ of CEM I (500 kg/m³ for
     *   blended cements), ECP 203-2025 clause 2-3-4-2-4 (p. 2-30).
     */
    mixes: {
      plain: {
        cementKgPerM3: 250, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 15, maxWc: null, maxWcFoundations: null, ref: 'cl. 2-3-2-1',
      },
      dry: {
        cementKgPerM3: 325, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 25, maxWc: 0.6, maxWcFoundations: null, ref: 'Table 2-21',
      },
      normal: {
        cementKgPerM3: 350, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 30, maxWc: 0.5, maxWcFoundations: 0.55, ref: 'Table 2-21',
      },
      wetDry: {
        cementKgPerM3: 375, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 35, maxWc: 0.45, maxWcFoundations: null, ref: 'Table 2-21',
      },
      chlorideModerate: {
        cementKgPerM3: 350, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 30, maxWc: 0.5, maxWcFoundations: null, ref: 'Table 2-22',
      },
      chlorideWet: {
        cementKgPerM3: 375, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 35, maxWc: 0.45, maxWcFoundations: null, ref: 'Table 2-22',
      },
      chlorideWetDry: {
        cementKgPerM3: 400, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 40, maxWc: 0.4, maxWcFoundations: null, ref: 'Table 2-22',
      },
      seaAir: {
        cementKgPerM3: 375, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 35, maxWc: 0.45, maxWcFoundations: null, ref: 'Table 2-23',
      },
      seaPrecast: {
        cementKgPerM3: 375, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 40, maxWc: 0.45, maxWcFoundations: null, ref: 'Table 2-23',
      },
      seaInSitu: {
        cementKgPerM3: 400, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 40, maxWc: 0.45, maxWcFoundations: null, ref: 'Table 2-23',
      },
      seaTidal: {
        cementKgPerM3: 425, sandM3PerM3: 0.4, gravelM3PerM3: 0.8,
        minFcu: 45, maxWc: 0.4, maxWcFoundations: null, ref: 'Table 2-23',
      },
    },
    /**
     * Reductions allowed when CEM III/A or CEM III/B is used instead of CEM I.
     * SOURCE: ECP 203-2025, footnote to Table 2-22 (p. 2-33). STATUS: Code.
     * Applies only to the chloride classes listed in `appliesTo`.
     */
    cemIIIReduction: {
      appliesTo: ['chlorideModerate', 'chlorideWet', 'chlorideWetDry'],
      cementKgPerM3: 25,
      minFcu: 2.5,
      maxWc: 0.05,
    },
    /** Screen grouping of the types above, first type is the zone's default. */
    zones: {
      normal: ['normal', 'dry', 'wetDry'],
      chloride: ['chlorideModerate', 'chlorideWet', 'chlorideWetDry'],
      seawater: ['seaAir', 'seaPrecast', 'seaInSitu', 'seaTidal'],
      plain: ['plain'],
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

  tiles: {
    /**
     * Tile size presets in cm, with a typical thickness in mm. The thickness
     * is the grout joint depth.
     * SOURCE: common sizes sold in Egypt. STATUS: Product; thickness varies by
     *   factory, so check the box label.
     */
    presets: {
      t30x30: { lengthCm: 30, widthCm: 30, thicknessMm: 8 },
      t40x40: { lengthCm: 40, widthCm: 40, thicknessMm: 8 },
      t60x60: { lengthCm: 60, widthCm: 60, thicknessMm: 9 },
      t60x120: { lengthCm: 60, widthCm: 120, thicknessMm: 9 },
    },
    /**
     * Cutting and breakage allowance on tiles.
     * SOURCE: general estimating allowance, commonly 5 to 10 %; use more for
     *   diagonal layouts or small rooms. STATUS: Practice.
     */
    defaultWastePercent: 10,
    /**
     * Default joint width between tiles.
     * SOURCE: common site practice for rectified porcelain and ceramic.
     * STATUS: Practice.
     */
    defaultJointMm: 3,

    adhesive: {
      /**
       * Cementitious tile adhesive consumption in kg per m², chosen by the
       * longest tile side. Larger tiles need a larger notched trowel and more
       * adhesive.
       * SOURCE: typical ranges from manufacturer Technical Data Sheets for
       *   C1/C2 adhesives classified to EN 12004: about 4 kg/m² with an 8 mm
       *   notch, 5 kg/m² with 10 mm, 6 kg/m² with 12 mm or back-buttering.
       * STATUS: Product. Replace with the TDS value of the adhesive you buy.
       */
      rates: [
        { maxSideCm: 40, kgPerM2: 4 },
        { maxSideCm: 60, kgPerM2: 5 },
        { maxSideCm: 9999, kgPerM2: 6 },
      ],
      /** SOURCE: common bag size. STATUS: Product. */
      bagKg: 20,
    },

    grout: {
      /**
       * Grout consumption (kg/m²) = (L + W) ÷ (L × W) × J × D × ρ
       * with L, W tile sides in mm, J joint width in mm, D joint depth in mm
       * and ρ grout density in kg/dm³.
       * SOURCE: the joint volume formula used in grout manufacturers'
       *   consumption tables; a density of about 1.6 kg/dm³ is typical for
       *   cementitious grout.
       * STATUS: Geometry for the formula; Product for the density.
       */
      densityKgPerDm3: 1.6,
      /** SOURCE: common bag size. STATUS: Product. */
      bagKg: 5,
    },

    /**
     * Extra adhesive and grout for mixing losses and uneven surfaces.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    materialWastePercent: 10,
  },

  paint: {
    /**
     * Finish paint coverage per coat, m² per liter.
     * SOURCE: typical theoretical spreading rate on manufacturer Technical
     *   Data Sheets for interior emulsion paints (about 10 to 12 m²/L on
     *   smooth, primed walls). STATUS: Product. Replace with your paint's
     *   TDS value; the user can also change it on screen.
     */
    coverageM2PerL: 10,
    /** SOURCE: common two-coat finish specification. STATUS: Practice. */
    defaultCoats: 2,
    /**
     * Default can size in liters (editable on screen).
     * STATUS: Product; check the size sold for your brand.
     */
    defaultCanLitres: 4,
    /**
     * Sealer (سيلر): one coat applied before putty.
     * SOURCE: typical TDS spreading rate of about 10 m²/L.
     * STATUS: Product.
     */
    sealer: { coverageM2PerL: 10, coats: 1 },
    /**
     * Wall putty (معجون): two coats before painting.
     * SOURCE: rough site figure of about 0.6 kg/m² per coat for ready-mixed
     *   acrylic putty. STATUS: Product, NOT verified against a data sheet;
     *   consumption depends strongly on how uneven the plaster is.
     */
    putty: { kgPerM2PerCoat: 0.6, coats: 2 },
    /**
     * Allowance for roller absorption, spills and touch-ups.
     * SOURCE: general estimating allowance. STATUS: Practice.
     */
    defaultWastePercent: 10,
  },
} as const;

export type MaterialSettings = typeof MATERIALS;
