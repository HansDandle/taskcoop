// Approximate centroids for Austin-area zip codes
export const ZIP_COORDS: Record<string, [number, number]> = {
  // [lng, lat]
  '78701': [-97.7431, 30.2672], // Downtown
  '78702': [-97.7201, 30.2638], // East Austin
  '78703': [-97.7631, 30.2838], // Tarrytown / Clarksville
  '78704': [-97.7571, 30.2438], // South Congress / Bouldin
  '78705': [-97.7401, 30.2938], // UT / Hyde Park
  '78712': [-97.7381, 30.2868], // UT Campus
  '78717': [-97.7741, 30.4638], // Cedar Park / NW Austin
  '78719': [-97.7001, 30.1538], // Southeast / Del Valle
  '78721': [-97.6901, 30.2738], // East Austin
  '78722': [-97.7101, 30.2888], // Cherrywood
  '78723': [-97.6901, 30.3038], // Windsor Park
  '78724': [-97.6601, 30.2938], // Northeast Austin
  '78725': [-97.6401, 30.2438], // Hornsby Bend
  '78726': [-97.8301, 30.4238], // NW Austin / Four Points
  '78727': [-97.7401, 30.4138], // North Austin / Rundberg
  '78728': [-97.7001, 30.4338], // Wells Branch
  '78729': [-97.7701, 30.4438], // North Austin / Jollyville
  '78730': [-97.8201, 30.3738], // River Place
  '78731': [-97.7801, 30.3538], // Highland Park / Loop 360
  '78732': [-97.8701, 30.3938], // Steiner Ranch
  '78733': [-97.8501, 30.3338], // West Lake Hills
  '78734': [-97.9001, 30.3838], // Lakeway
  '78735': [-97.8201, 30.2738], // Oak Hill
  '78736': [-97.8701, 30.2438], // West Austin / Bee Cave Rd
  '78737': [-97.8601, 30.2038], // Buda / SW Austin
  '78738': [-97.9201, 30.3238], // Bee Cave
  '78739': [-97.8501, 30.1938], // Circle C
  '78741': [-97.7101, 30.2238], // South East Austin / Riverside
  '78742': [-97.6901, 30.2238], // SE Austin
  '78744': [-97.7201, 30.1838], // South Austin / Slaughter
  '78745': [-97.7801, 30.2138], // South Austin / William Cannon
  '78746': [-97.8001, 30.2938], // West Lake Hills / Tarrytown
  '78747': [-97.7601, 30.1438], // South Austin / Manchaca
  '78748': [-97.8001, 30.1738], // South Austin / Slaughter
  '78749': [-97.8301, 30.2238], // Oak Hill / Southwest
  '78750': [-97.8001, 30.4338], // Northwest Hills
  '78751': [-97.7201, 30.3138], // Hyde Park / North Loop
  '78752': [-97.7001, 30.3338], // North Loop
  '78753': [-97.6801, 30.3738], // North Austin / Rundberg
  '78754': [-97.6601, 30.3538], // Northeast Austin
  '78756': [-97.7401, 30.3238], // Rosedale
  '78757': [-97.7401, 30.3538], // Crestview / Brentwood
  '78758': [-97.7101, 30.3838], // North Austin / Rundberg
  '78759': [-97.7701, 30.3938], // Northwest Hills / Anderson Mill
  '78610': [-97.8401, 30.0838], // Buda
  '78613': [-97.8201, 30.5138], // Cedar Park
  '78620': [-98.0001, 30.2238], // Dripping Springs
  '78641': [-97.8601, 30.5738], // Leander
  '78645': [-97.9501, 30.4538], // Lago Vista
  '78660': [-97.6101, 30.4438], // Pflugerville
  '78664': [-97.6501, 30.5138], // Round Rock
  '78665': [-97.6101, 30.5338], // Round Rock East
  '78681': [-97.7201, 30.5138], // Round Rock West
  '78701': [-97.7431, 30.2672], // Downtown (duplicate key, last wins)
}

export function getZipCoords(zip: string): [number, number] | null {
  return ZIP_COORDS[zip] ?? null
}
