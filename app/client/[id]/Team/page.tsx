'use client';
import { Table, TableRow, TableBody, TableHead, TableHeader, TableCell } from "@/components/ui/table";
import Image from "next/image";
const Team = () => {
  const team = [
    {
      image: "",
      name: "",
      email: "",
      role: "",
    }
  ]
  return (
    <section className="flex flex-col gap-4 px-4 py-6">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((item) => (
              <TableRow key={item.name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10">
                      <Image
                        fill
                        src={item.image}
                        alt={item.name}
                        className="rounded-full"
                      />
                    </div>
                    <div className="font-medium">{item.name}</div>
                  </div>
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
export default Team;
