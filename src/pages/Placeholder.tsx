import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} description="هذه الشاشة قيد التطوير ضمن الخطة." />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Construction className="h-10 w-10" />
          <p>سيتم بناء هذه الوحدة في المرحلة القادمة من خطة التنفيذ.</p>
        </CardContent>
      </Card>
    </div>
  );
}
