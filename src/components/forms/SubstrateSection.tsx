import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CustomSelect } from './CustomSelect'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { SUBSTRATES, SURFACE_TYPES, TREATMENT_SIDES, FOIL_TYPES } from '@/lib/constants'

export function SubstrateSection() {
  const { formData, updateField } = useTDSFormStore()

  return (
    <div className="glass-panel border-white/5 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">2</div>
        <h3 className="text-lg font-bold tracking-widest text-foreground uppercase">SUBSTRATE · CORONA · FOIL DETAILS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="substrate_laminate">Substrate / Laminate</Label>
          <CustomSelect
            value={formData.substrate_laminate || ''}
            onChange={(value) => updateField('substrate_laminate', value)}
            options={SUBSTRATES}
            placeholder="Select substrate"
            allowCustom
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="surface_type">Surface Type</Label>
          <CustomSelect
            value={formData.surface_type || ''}
            onChange={(value) => updateField('surface_type', value)}
            options={SURFACE_TYPES}
            placeholder="Select surface type"
            allowCustom
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="width_mm">Width (mm)</Label>
          <Input
            id="width_mm"
            type="number"
            min={50}
            max={2000}
            value={formData.width_mm || ''}
            onChange={(e) => updateField('width_mm', parseInt(e.target.value))}
            placeholder="350"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="corona_treatment"
              checked={formData.corona_treatment || false}
              onCheckedChange={(checked) => updateField('corona_treatment', checked)}
            />
            <Label htmlFor="corona_treatment" className="cursor-pointer">
              Corona Treatment
            </Label>
          </div>
        </div>

        {formData.corona_treatment && (
          <>
            <div className="space-y-2">
              <Label htmlFor="corona_wattage">Wattage</Label>
              <Input
                id="corona_wattage"
                type="number"
                min={0}
                max={2000}
                value={formData.corona_wattage || ''}
                onChange={(e) => updateField('corona_wattage', parseInt(e.target.value))}
                placeholder="800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corona_treatment_side">Treatment Side</Label>
              <CustomSelect
                value={formData.corona_treatment_side || ''}
                onChange={(value) => updateField('corona_treatment_side', value)}
                options={TREATMENT_SIDES}
                placeholder="Select side"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corona_dyne_level">Dyne Level</Label>
              <Input
                id="corona_dyne_level"
                type="number"
                min={0}
                max={100}
                value={formData.corona_dyne_level || ''}
                onChange={(e) => updateField('corona_dyne_level', parseInt(e.target.value))}
                placeholder="38"
              />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="foil_supplier">Foil Supplier</Label>
          <Input
            id="foil_supplier"
            value={formData.foil_supplier || ''}
            onChange={(e) => updateField('foil_supplier', e.target.value)}
            placeholder="API Foils Ltd."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foil_type">Foil Type</Label>
          <CustomSelect
            value={formData.foil_type || ''}
            onChange={(value) => updateField('foil_type', value)}
            options={FOIL_TYPES}
            placeholder="Select foil type"
            allowCustom
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foil_colour_finish">Foil Colour/Finish</Label>
          <Input
            id="foil_colour_finish"
            value={formData.foil_colour_finish || ''}
            onChange={(e) => updateField('foil_colour_finish', e.target.value)}
            placeholder="Metallic Gold"
          />
        </div>
      </div>
    </div>
  )
}