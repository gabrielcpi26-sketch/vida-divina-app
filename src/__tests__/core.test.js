
import { describe, it, expect } from 'vitest'
import { bmiFrom, bmiCategory, recommend } from '../lib/recommender'
import { buildProducts } from '../data/catalog'

describe('IMC & recomendaciones', () => {
  it('bmiFrom calcula correctamente', () => {
    const bmiCalc = +(72 / (1.7 * 1.7)).toFixed(1)
    expect(bmiFrom(170,72)).toBe(bmiCalc)
  })
  it('categorías de IMC', () => {
    expect(bmiCategory(17).id).toBe('under')
    expect(bmiCategory(24.9).id).toBe('normal')
    expect(bmiCategory(29.9).id).toBe('over')
    expect(bmiCategory(30).id).toBe('obese')
  })
  it('recommend retorna estructura', () => {
    const r = recommend(22, 'bajar_peso')
    expect(!!r.primaryId).toBe(true)
    expect(Array.isArray(r.alts)).toBe(true)
  })
  it('recommend masa y hcg', () => {
    expect(recommend(25,'aumentar_masa').primaryId).toBe('vida-protein')
    expect(recommend(31,'bajar_peso').primaryId).toBe('hcg')
  })
})

describe('Catálogo', () => {
  it('buildProducts genera listado', () => {
    const built = buildProducts()
    expect(Array.isArray(built)).toBe(true)
    expect(built.length).toBeGreaterThanOrEqual(20)
    expect(built.some(p=>p.id==='te-divina')).toBe(true)
  })
})
