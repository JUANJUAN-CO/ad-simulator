import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import MentorBubble from '@/components/mentor/mentor-bubble';
import SimulationProvider from '@/components/simulation-provider';
import EventBanner from '@/components/layout/event-banner';
import NotificationToast from '@/components/ui/notification';
import DailyReport from '@/components/ui/daily-report';
import OnboardingOverlay from '@/components/ui/onboarding';
import ErrorBoundary from '@/components/ui/error-boundary';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
    <SimulationProvider>
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-[200px] ml-0">
          <Topbar />
          <EventBanner />
          <main className="flex-1 lg:mt-12 mt-10 p-2 lg:p-4 overflow-auto bg-[#f5f6f7]">
            {children}
          </main>
        </div>
        <MentorBubble />
        <NotificationToast />
        <DailyReport />
        <OnboardingOverlay />
      </div>
    </SimulationProvider>
    </ErrorBoundary>
  );
}
