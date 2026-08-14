import { BookOpen, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MissionVision() {
  return (
    <>
      <Card className="border-none shadow-lg">
        <CardContent className="space-y-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold font-display text-2xl">Our Mission</h3>
          <p className="text-muted-foreground">
            The Refuge Church is determined to Share the Gospel, teach Biblical
            Truth, and encourage disciples to grow in Godly obedience until the
            return of our Lord Jesus Christ.
          </p>
        </CardContent>
      </Card>
      <Card className="border-none shadow-lg">
        <CardContent className="space-y-4 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold font-display text-2xl">Our Vision</h3>
          <p className="text-muted-foreground">
            The Refuge Church is a unified Church body committed to be a
            reflection of God's love as a Refuge for the lost to come and be
            Cared for, Lifted up, and Encouraged to Grow in personal
            relationship with the Lord Jesus Christ for the Glory of God.
          </p>
        </CardContent>
      </Card>
    </>
  );
}


