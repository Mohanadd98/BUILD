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
} as const;

export type MaterialSettings = typeof MATERIALS;
