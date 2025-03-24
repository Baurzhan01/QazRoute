"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Download, FileText, Info } from "lucide-react"
import Link from "next/link"

export default function DirectoryPage() {
  const [activeTab, setActiveTab] = useState("instructions")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/fleet-manager">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-rose-600">Справочник</h1>
          <p className="text-gray-500 mt-1">Справочная информация, инструкции и документация</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Tabs defaultValue="instructions" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Инструкции</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-rose-500" />
                  Инструкции
                </CardTitle>
                <CardDescription>Руководства и инструкции по работе с системой</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Руководство по плану выпуска</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        <p>
                          План выпуска автобусов – это документ, определяющий количество автобусов, которые должны быть
                          выпущены на каждый маршрут в определенный день.
                        </p>
                        <p>Для создания плана выпуска:</p>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>Перейдите в раздел "План выпуска"</li>
                          <li>Выберите маршрут из списка</li>
                          <li>Добавьте автобусы и назначьте водителей</li>
                          <li>Сохраните план</li>
                          <li>Просмотрите итоговый план выпуска</li>
                          <li>Подтвердите план для реализации</li>
                        </ol>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="mt-2">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Инструкция по управлению водителями</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        <p>Раздел "Водители" позволяет управлять информацией о водителях, их статусе и назначениях.</p>
                        <p>Основные функции:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Добавление нового водителя</li>
                          <li>Редактирование информации о водителе</li>
                          <li>Изменение статуса водителя</li>
                          <li>Назначение водителя на маршрут</li>
                          <li>Просмотр истории работы водителя</li>
                        </ul>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="mt-2">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Инструкция по управлению автобусами</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        <p>
                          Раздел "Автобусы" позволяет управлять информацией об автобусах, их состоянии и назначениях.
                        </p>
                        <p>Основные функции:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Добавление нового автобуса</li>
                          <li>Редактирование информации об автобусе</li>
                          <li>Изменение статуса автобуса</li>
                          <li>Назначение автобуса на маршрут</li>
                          <li>Просмотр истории обслуживания</li>
                        </ul>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="mt-2">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-500" />
                  Документы
                </CardTitle>
                <CardDescription>Нормативные документы и формы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium">Форма путевого листа</p>
                        <p className="text-xs text-gray-500">PDF • 245 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium">Правила технического обслуживания</p>
                        <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium">График работы водителей</p>
                        <p className="text-xs text-gray-500">XLSX • 78 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium">Инструкция по безопасности</p>
                        <p className="text-xs text-gray-500">PDF • 815 KB</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Скачать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-rose-500" />
                  Контакты
                </CardTitle>
                <CardDescription>Контактная информация для связи с технической поддержкой</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Техническая поддержка</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Телефон:</span>
                        <span>+7 (495) 123-45-67</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>support@busfleet.ru</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Время работы:</span>
                        <span>Пн-Пт, 9:00 - 18:00</span>
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Диспетчерская служба</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Телефон (круглосуточно):</span>
                        <span>+7 (495) 765-43-21</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>dispatch@busfleet.ru</span>

                        <span>dispatch@busfleet.ru</span>
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">Администрация</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Телефон:</span>
                        <span>+7 (495) 987-65-43</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>admin@busfleet.ru</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Адрес:</span>
                        <span>г. Москва, ул. Автобусная, д. 10</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

