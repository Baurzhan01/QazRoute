"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Bus,
  Calendar,
  Clock,
  Users,
  Wrench,
} from "lucide-react";
import Loader from "@/components/ui/Loader";

export default function Home() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // универсальная функция для показа лоадера и перехода на /login
  const handleStart = () => {
    setShowLoader(true);
    // ждём 2 секунды (имитация загрузки), потом переходим
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* если showLoader=true, показываем полноэкранный лоадер */}
      {showLoader && <Loader autoClose={false} />}

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              <img
                src="/images/logo-qazroute.png"
                alt="QAZROUTE"
                className="h-20 w-auto"
              />
            </Link>
            <span className="hidden font-bold sm:inline-block">
              Управление автобусным парком
            </span>
          </div>
          <nav className="flex flex-1 items-center justify-end">
            {/* заменяем Link на кнопку с onClick, чтобы тоже показывать лоадер */}
            <Button onClick={handleStart}>Вход</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-sky-100 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-sky-700">
                  Портал управления автобусным парком
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Оптимизируйте работу вашего автобусного парка с нашим
                  комплексным решением для управления
                </p>
              </div>

              {/* === изменили кнопки === */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-600"
                  onClick={handleStart}
                >
                  Начать работу
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button size="lg" variant="outline">
                  Узнать больше
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* остальная часть страницы без изменений */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-sky-700">
                  Ролевой доступ
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Наш портал поддерживает несколько ролей пользователей с
                  индивидуальными интерфейсами и разрешениями
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <RoleCard
                title="Менеджер автопарка"
                description="Управление автопарком, мониторинг состояния транспорта и принятие стратегических решений"
                icon={<Bus className="h-10 w-10 text-yellow-400" />}
              />
              <RoleCard
                title="Механик"
                description="Отслеживание технического состояния автобусов, планирование и проведение техобслуживания"
                icon={<Wrench className="h-10 w-10 text-yellow-400" />}
              />
              <RoleCard
                title="Старший диспетчер"
                description="Координация диспетчеров, контроль выполнения расписания и маршрутов"
                icon={<Calendar className="h-10 w-10 text-yellow-400" />}
              />
              <RoleCard
                title="Диспетчер"
                description="Управление ежедневными маршрутами, взаимодействие с водителями, решение оперативных задач"
                icon={<Clock className="h-10 w-10 text-yellow-400" />}
              />
              <RoleCard
                title="Дежурный механик"
                description="Реагирование на технические проблемы в реальном времени, организация срочного ремонта"
                icon={<Wrench className="h-10 w-10 text-yellow-400" />}
              />
              <RoleCard
                title="Отдел кадров"
                description="Управление персоналом, учет рабочего времени, найм и обучение сотрудников"
                icon={<Users className="h-10 w-10 text-yellow-400" />}
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-sky-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-sky-700">
                  Ключевые возможности
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Разработано для эффективного и удобного управления автопарком
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <FeatureCard
                title="Мониторинг в реальном времени"
                description="Отслеживайте весь автопарк в реальном времени с подробными обновлениями статуса и оповещениями"
              />
              <FeatureCard
                title="Планирование техобслуживания"
                description="Планируйте и отслеживайте работы по техобслуживанию, чтобы ваш автопарк всегда был в оптимальном состоянии"
              />
              <FeatureCard
                title="Управление маршрутами"
                description="Эффективно планируйте и корректируйте маршруты для максимального охвата и минимизации затрат"
              />
              <FeatureCard
                title="Управление персоналом"
                description="Комплексные инструменты для управления водителями, механиками и административным персоналом"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-sky-700 py-6 text-white">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2025 Портал управления автобусным парком. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm underline underline-offset-4"
            >
              Условия
            </Link>
            <Link
              href="/privacy"
              className="text-sm underline underline-offset-4"
            >
              Конфиденциальность
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="group flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="mb-2 flex justify-center">{icon}</div>
        <CardTitle className="text-xl text-sky-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className="text-sky-600 group-hover:bg-sky-50"
        >
          Подробнее
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-xl text-sky-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className="text-sky-600 group-hover:bg-sky-50"
        >
          Изучить
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
