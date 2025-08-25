import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cats } from '@/lib/data';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge } from '../ui/badge';

export default function CatsTable() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Resim</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Cins</TableHead>
              <TableHead className="hidden md:table-cell">Yaş</TableHead>
              <TableHead className="hidden md:table-cell">Cinsiyet</TableHead>
              <TableHead>
                <span className="sr-only">Eylemler</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cats.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Kedi resmi"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={cat.image}
                    width="64"
                    data-ai-hint={cat.dataAiHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{cat.breed}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{cat.age} yaş</TableCell>
                <TableCell className="hidden md:table-cell">{cat.gender === 'Male' ? 'Erkek' : 'Dişi'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menüyü aç</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
                      <DropdownMenuItem>Düzenle</DropdownMenuItem>
                      <DropdownMenuItem>Sil</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
