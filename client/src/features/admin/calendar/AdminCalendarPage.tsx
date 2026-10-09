import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Plus, 
  ExternalLink,
  Phone,
  CalendarCheck
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { formatDate } from '../../../lib/utils';

export const AdminCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch calendar events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-calendar', year, month + 1],
    queryFn: async () => {
      const res = await api.get<{
        bookings: any[];
        followUps: any[];
      }>(`/calendar?year=${year}&month=${month + 1}`);
      return res.data;
    },
  });

  const bookings = eventsData?.bookings || [];
  const followUps = eventsData?.followUps || [];

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: any[];
      followUps: any[];
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];
    const selectedStr = selectedDate.toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedStr,
        events: bookings.filter((b) => b.startDate && b.startDate.startsWith(dStr)),
        followUps: followUps.filter((f) => f.followUpDate && f.followUpDate.startsWith(dStr)),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedStr,
        events: bookings.filter((b) => b.startDate && b.startDate.startsWith(dStr)),
        followUps: followUps.filter((f) => f.followUpDate && f.followUpDate.startsWith(dStr)),
      });
    }

    // Next month padding to reach a multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedStr,
        events: bookings.filter((b) => b.startDate && b.startDate.startsWith(dStr)),
        followUps: followUps.filter((f) => f.followUpDate && f.followUpDate.startsWith(dStr)),
      });
    }

    return days;
  }, [year, month, bookings, followUps, selectedDate]);

  // Selected date events
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDayBookings = useMemo(() => {
    return bookings.filter((b) => b.startDate && b.startDate.startsWith(selectedDateStr));
  }, [bookings, selectedDateStr]);

  const selectedDayFollowUps = useMemo(() => {
    return followUps.filter((f) => f.followUpDate && f.followUpDate.startsWith(selectedDateStr));
  }, [followUps, selectedDateStr]);

  // Conflict detection: more than 1 booking on the same day
  const hasConflict = selectedDayBookings.length > 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-brand-gold" />
            Event & Schedule Calendar
          </h1>
          <p className="text-sm text-brand-muted">
            Manage auspicious wedding muhurtham dates, event setups, and team assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Link to="/admin/bookings">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Bookings List
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Loading auspicious schedule and bookings..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-5 shadow-sm border border-brand-border/60">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-brand-dark">
                  {monthNames[month]} {year}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-brand-bg transition-colors border border-brand-border/60 text-brand-dark"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-brand-bg transition-colors border border-brand-border/60 text-brand-dark"
                    title="Next Month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-brand-muted uppercase tracking-wider">
                <div className="text-red-600">Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-brand-gold">Sat</div>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const dayNum = day.date.getDate();
                  const eventCount = day.events.length;
                  const followUpCount = day.followUps.length;
                  const isConflictDay = eventCount > 1;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day.date)}
                      className={`min-h-[86px] p-2 rounded-xl text-left transition-all border flex flex-col justify-between relative group ${
                        day.isSelected
                          ? 'border-brand-gold bg-brand-gold/10 ring-2 ring-brand-gold shadow-sm'
                          : day.isToday
                          ? 'border-brand-gold/60 bg-brand-bg'
                          : day.isCurrentMonth
                          ? 'border-brand-border/40 bg-white hover:border-brand-gold/50 hover:bg-brand-bg/40'
                          : 'border-transparent bg-brand-bg/20 text-brand-muted/50 hover:bg-brand-bg/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                            day.isToday
                              ? 'bg-brand-gold text-white'
                              : day.isCurrentMonth
                              ? 'text-brand-dark'
                              : 'text-brand-muted/40'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {isConflictDay && (
                          <span
                            title="Multiple bookings on this date!"
                            className="text-amber-500 bg-amber-50 p-0.5 rounded"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Event Badges in Day Cell */}
                      <div className="w-full space-y-1 mt-1 overflow-hidden">
                        {day.events.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate ${
                              ev.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ev.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : ev.status === 'TENTATIVE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-brand-bg text-brand-dark'
                            }`}
                          >
                            {ev.eventName || ev.customer?.name}
                          </div>
                        ))}
                        {eventCount > 2 && (
                          <div className="text-[9px] text-brand-muted font-bold pl-1">
                            +{eventCount - 2} more
                          </div>
                        )}
                        {followUpCount > 0 && eventCount === 0 && (
                          <div className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded truncate">
                            📞 {followUpCount} Follow-up
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-brand-border/60 text-xs text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Confirmed Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Tentative / Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span>Consultation / Follow-up</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Date Overlap Warning</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Schedule Detail Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 shadow-sm border border-brand-border/60">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                <div>
                  <h3 className="font-serif font-bold text-brand-dark text-lg">
                    Schedule for {formatDate(selectedDateStr)}
                  </h3>
                  <p className="text-xs text-brand-muted">
                    {selectedDayBookings.length} booking(s), {selectedDayFollowUps.length} follow-up(s)
                  </p>
                </div>
              </div>

              {/* Overlap Alert */}
              {hasConflict && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Date Overlap Alert</strong>
                    Multiple major events are scheduled on this date. Verify decor crew, sound system, and transportation logistics.
                  </div>
                </div>
              )}

              {/* Day Events List */}
              <div className="mt-4 space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {selectedDayBookings.length === 0 && selectedDayFollowUps.length === 0 ? (
                  <div className="py-12 text-center text-brand-muted">
                    <CalendarCheck className="w-10 h-10 text-brand-gold/40 mx-auto mb-2" />
                    <p className="text-sm font-medium">No events scheduled on this date.</p>
                    <p className="text-xs text-brand-muted mt-1">
                      Ready for new auspicious bookings.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bookings */}
                    {selectedDayBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-xl border border-brand-border/80 bg-brand-bg/30 hover:border-brand-gold/60 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-brand-gold font-bold tracking-wider block">
                              {b.reference}
                            </span>
                            <h4 className="font-serif font-bold text-brand-dark text-base">
                              {b.eventName}
                            </h4>
                            <p className="text-xs text-brand-muted">
                              Customer: <span className="font-medium text-brand-dark">{b.customer?.name}</span>
                            </p>
                          </div>
                          <StatusBadge status={b.status} type="booking" />
                        </div>

                        <div className="space-y-1.5 text-xs text-brand-muted">
                          {b.venueName && (
                            <div className="flex items-center gap-2 text-brand-dark">
                              <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                              <span className="truncate">{b.venueName} {b.venueCity ? `(${b.venueCity})` : ''}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                            <span>{new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {b.guestCount && (
                              <>
                                <span className="text-brand-border">•</span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {b.guestCount} Guests
                                </span>
                              </>
                            )}
                          </div>
                          {b.customer?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                              <span>{b.customer.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Assigned Crew preview */}
                        {b.assignments && b.assignments.length > 0 && (
                          <div className="pt-2 border-t border-brand-border/60">
                            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
                              Assigned Crew ({b.assignments.length})
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {b.assignments.map((as: any) => (
                                <span
                                  key={as.id}
                                  className="text-[10px] bg-white border border-brand-border px-2 py-0.5 rounded-full text-brand-dark"
                                >
                                  {as.staff?.name || as.vendor?.businessName} ({as.role})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Link to={`/admin/bookings/${b.id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                              View Booking
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Follow-Ups */}
                    {selectedDayFollowUps.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-purple-600" />
                            Customer Consultation Follow-up
                          </span>
                        </div>
                        <p className="text-purple-950 font-medium">{f.note}</p>
                        {f.enquiry && (
                          <div className="flex items-center justify-between pt-1 text-[11px] text-purple-700">
                            <span>Client: {f.enquiry.customer?.name}</span>
                            <Link
                              to="/admin/enquiries"
                              className="font-semibold underline hover:text-purple-900"
                            >
                              Enquiry #{f.enquiry.reference}
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
