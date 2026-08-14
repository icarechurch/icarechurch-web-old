import { careItems } from "@/shared/constants/care";

export function CareGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {careItems.map((item, index) => (
        <div
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          key={item.letter}
        >
          {/* Background gradient on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
          />

          {/* Large letter background */}
          <span className="absolute -top-4 -right-2 font-bold text-8xl text-church-gold/10 transition-all duration-300 group-hover:text-church-gold/20">
            {item.letter}
          </span>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon container */}
            <div
              className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
            >
              <item.icon className="h-7 w-7 text-white" />
            </div>

            {/* Step number */}
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold text-church-gold text-xs uppercase tracking-wider">
                Step {index + 1}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 font-bold font-sans text-church-navy text-lg">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Bottom accent line */}
          <div
            className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          />
        </div>
      ))}
    </div>
  );
}
