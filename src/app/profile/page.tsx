import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adoptionRequests, User } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserCircle2 } from "lucide-react";

const mockUser: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatar: 'https://placehold.co/100x100.png',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-6 mb-12">
        <Avatar className="h-24 w-24">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} data-ai-hint="profile person" />
          <AvatarFallback>
            <UserCircle2 className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-headline font-bold">{mockUser.name}</h1>
          <p className="text-lg text-muted-foreground">{mockUser.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My Adoption Requests</CardTitle>
          <CardDescription>Here's a list of your recent adoption applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cat Name</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adoptionRequests.length > 0 ? (
                  adoptionRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.catName}</TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={cn({
                            'bg-yellow-500/80 text-yellow-900 border-yellow-600/50': request.status === 'Pending',
                            'bg-green-500/80 text-green-900 border-green-600/50': request.status === 'Approved',
                            'bg-red-500/80 text-red-900 border-red-600/50': request.status === 'Rejected',
                          })}
                          variant="outline"
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No adoption requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
