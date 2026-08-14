import { Card, CardContent } from "@/components/ui/card";

export const GivingQuote = () => {
  return (
    <div className="mx-auto mt-12 max-w-2xl text-center md:mt-16">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm italic md:text-base">
            "Each of you should give what you have decided in your heart
            to give, not reluctantly or under compulsion, for God loves
            a cheerful giver." - 2 Corinthians 9:7
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
