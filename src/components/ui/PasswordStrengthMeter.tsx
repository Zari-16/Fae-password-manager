import { analyzePasswordStrength } from '../../utils/crypto'

interface Props {
  password: string
}

export function PasswordStrengthMeter({ password }: Props) {
  const { score, label, color, entropy } = analyzePasswordStrength(password)
  if (!password) return null

  const bars = [0, 1, 2, 3, 4]

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {bars.map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= score ? color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        {entropy > 0 && (
          <span className="text-xs text-gray-500">{entropy} bits entropy</span>
        )}
      </div>
    </div>
  )
}
