
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminTicketsList() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("@/actions/support-actions").then(({ getSupportTickets }) => {
            getSupportTickets().then(res => {
                if (res.success && res.tickets) {
                    setTickets(res.tickets);
                }
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div className="text-sm text-slate-500">Loading tickets...</div>;
    if (tickets.length === 0) return <div className="text-sm text-slate-500">No open tickets.</div>;

    return (
        <Card className="shadow-sm border-slate-200">
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                             <tr>
                                 <th className="px-6 py-3 font-medium">User</th>
                                 <th className="px-6 py-3 font-medium">Topic</th>
                                 <th className="px-6 py-3 font-medium">Message</th>
                                 <th className="px-6 py-3 font-medium">Date</th>
                                 <th className="px-6 py-3 font-medium">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {tickets.map((ticket) => (
                                 <tr key={ticket.id} className="hover:bg-slate-50/50">
                                     <td className="px-6 py-4">
                                         <p className="font-bold text-slate-900">{ticket.name}</p>
                                         <p className="text-xs text-slate-500">{ticket.email}</p>
                                         {ticket.phone && <p className="text-xs text-slate-400">{ticket.phone}</p>}
                                     </td>
                                     <td className="px-6 py-4 capitalize">
                                         <Badge variant="outline">{ticket.category}</Badge>
                                     </td>
                                     <td className="px-6 py-4 max-w-xs truncate" title={ticket.message}>
                                         {ticket.message}
                                     </td>
                                     <td className="px-6 py-4 text-slate-500">
                                         {new Date(ticket.createdAt).toLocaleDateString()}
                                     </td>
                                     <td className="px-6 py-4">
                                         <Badge className={
                                             ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                                             ticket.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                                         }>
                                             {ticket.status}
                                         </Badge>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </CardContent>
        </Card>
    )
}
