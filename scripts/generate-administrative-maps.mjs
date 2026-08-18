import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const UPSTREAM_REPOSITORY =
  'https://github.com/thanglequoc/vietnamese-provinces-database'
const UPSTREAM_COMMIT = 'cd58063299585146ded3981f2272946ef19ced54'
const TREE_URL = `https://api.github.com/repos/thanglequoc/vietnamese-provinces-database/git/trees/${UPSTREAM_COMMIT}?recursive=1`
const RAW_URL = `https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/${UPSTREAM_COMMIT}`
const OUTPUT_DIRECTORY = resolve('public/data/administrative-maps')
const VALUES_OUTPUT = resolve('src/data/administrative-map-values.ts')

const tree = await fetchJson(TREE_URL)
const paths = tree.tree.map((entry) => entry.path)
const provincePaths = paths.filter((path) =>
  /^json\/geojson\/\d{2}_[^/]+\/\d{2}_[^/]+\.geojson$/.test(path)
)
const daNangWardPaths = paths.filter(
  (path) =>
    path.startsWith('json/geojson/48_da_nang/wards/') &&
    path.endsWith('.geojson')
)

const [provinces, daNangWards] = await Promise.all([
  collectFeatures(provincePaths),
  collectFeatures(daNangWardPaths)
])

await mkdir(OUTPUT_DIRECTORY, { recursive: true })
await Promise.all([
  writeGeoJson('vietnam-provinces.geojson', provinces),
  writeGeoJson('da-nang-wards.geojson', daNangWards),
  writeValueCatalog(provinces, daNangWards)
])

console.log(
  `Generated ${provinces.length} provinces and ${daNangWards.length} Da Nang wards.`
)

async function collectFeatures(pathsToCollect) {
  const collections = await mapWithConcurrency(
    pathsToCollect,
    6,
    async (path) => fetchJson(`${RAW_URL}/${path}`)
  )

  return collections.map((collection) =>
    normalizeFeature(collection.features[0])
  )
}

function normalizeFeature(feature) {
  const { code, name, fullName, areaKm2 } = feature.properties

  return {
    type: 'Feature',
    id: code,
    properties: { code, name, fullName, areaKm2 },
    geometry: feature.geometry
  }
}

async function writeGeoJson(filename, features) {
  const output = {
    type: 'FeatureCollection',
    source: `${UPSTREAM_REPOSITORY}/tree/${UPSTREAM_COMMIT}`,
    features
  }

  await writeFile(
    resolve(OUTPUT_DIRECTORY, filename),
    `${JSON.stringify(output)}\n`,
    'utf8'
  )
}

async function writeValueCatalog(provinces, daNangWards) {
  const source = `// Generated from the normalized administrative GeoJSON source.\nconst VIETNAM_PROVINCE_VALUES = ${formatValueArray(
    provinces.map((feature) => feature.properties.code)
  )} as const\n\nconst DANANG_WARD_VALUES = ${formatValueArray(
    daNangWards.map((feature) => feature.properties.code)
  )} as const\n\nexport { DANANG_WARD_VALUES, VIETNAM_PROVINCE_VALUES }\n`

  await writeFile(VALUES_OUTPUT, source, 'utf8')
}

function formatValueArray(values) {
  const rows = []
  for (let index = 0; index < values.length; index += 12) {
    rows.push(
      `  ${values
        .slice(index, index + 12)
        .map((value) => `'${value}'`)
        .join(', ')}`
    )
  }

  return `[\n${rows.join(',\n')}\n]`
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Unable to download ${url}: ${response.status}`)

  return response.json()
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await mapper(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  )
  return results
}
