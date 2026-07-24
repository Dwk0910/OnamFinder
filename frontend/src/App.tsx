import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  MapPin,
  Search,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { LostItemFormView } from "./component/LostItemFormView";
import { ItemDetailModal } from "./component/ItemDetailModal";
import { ServerImg } from "./component/ServerImg";

import logo from "./assets/logo.png";

// ==========================================
// 1. 최상위 전역 변수 (BACKEND_ADDRESS) 설정
// ==========================================
let BACKEND_HOST = "localhost:8080";
try {
  const metaEnv = new Function("return import.meta.env")();
  if (metaEnv && metaEnv.VITE_BACKEND_HOST) {
    BACKEND_HOST = metaEnv.VITE_BACKEND_HOST;
  }
} catch (e) {
  // 환경변수가 없을 경우 로컬 호스트 사용
}

const isLocal = BACKEND_HOST.includes("localhost") || BACKEND_HOST.includes("127.0.0.1");
const protocol = isLocal ? "http://" : "https://";
export const BACKEND_ADDRESS = `${protocol}${BACKEND_HOST}/`;

// ==========================================
// 2. 타입 정의 (API 명세서 기준)
// ==========================================
export interface LostItem {
  id: string;
  title: string;
  category: string;
  features: string[];
  foundAt: number;
  foundLocation: string;
  findMethod: string;
  images: string[];
  content: string;
  status: "FINDING" | "COMPLETED";
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ==========================================
// 6. 알림 메시지 모달 (Toast)
// ==========================================
interface ToastNotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

function ToastNotification({ message, type, onClose }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
      <div className="absolute top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className={`w-full max-w-sm p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 border backdrop-blur-md pointer-events-auto animate-toastIn ${
            type === "success"
                ? "bg-slate-900/90 border-emerald-500/40 text-emerald-400"
                : "bg-slate-900/90 border-rose-500/40 text-rose-400"
        }`}>
          {type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0 animate-scalePulse" />
          ) : (
              <AlertCircle className="w-5 h-5 shrink-0 animate-scalePulse" />
          )}
          <span className="text-xs font-bold tracking-tight text-slate-100">{message}</span>
          <button onClick={onClose} className="ml-auto hover:opacity-80 p-1 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
}

// ==========================================
// 7. 하이엔드 애니메이션 스타일 주입 (Tailwind 확장)
// ==========================================
function AnimationStyles() {
  return (
      <style dangerouslySetInnerHTML={{ __html: `
            @keyframes toastIn {
                0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
                50% { transform: translateY(4px) scale(1.02); }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes slideUp {
                0% { transform: translateY(100%); }
                100% { transform: translateY(0); }
            }
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes scalePulse {
                0% { transform: scale(0.9); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            .animate-toastIn { animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-scalePulse { animation: scalePulse 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            
            .stagger-1 { animation-delay: 50ms; }
            .stagger-2 { animation-delay: 100ms; }
            .stagger-3 { animation-delay: 150ms; }

            .scrollbar-none::-webkit-scrollbar { display: none; }
            .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
  );
}

// ==========================================
// 8. 모바일 레이아웃 메인 컴포넌트
// ==========================================
export default function App() {
  const [view, setView] = useState<"list" | "create">("list");
  const [items, setItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [serverError, setServerError] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setIsLoading(true);
        setServerError(false);
        const res = await axios.get<PageResponse<LostItem>>(`${BACKEND_ADDRESS}lostitems`);
        setItems(res.data.content);
      } catch (err) {
        console.error(err);
        setServerError(true);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchLostItems();
  }, [refreshTrigger]);

  // 가져온 데이터 기반으로 고유 카테고리 목록 동적 생성
  const dynamicCategories = ["전체", ...Array.from(new Set(items.map((item) => item.category))).sort()];

  // 만약 선택되어 있던 카테고리가 갱신 후 배열에서 사라지면 자동으로 '전체'로 복귀시킴
  useEffect(() => {
    if (!dynamicCategories.includes(selectedCategory)) {
      setSelectedCategory("전체");
    }
  }, [items, dynamicCategories, selectedCategory]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.foundLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
      <div className="bg-[#030712] min-h-screen text-slate-100 flex justify-center font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
        <AnimationStyles />

        <div className="w-full max-w-md bg-[#090d16] h-screen shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col relative border-x border-slate-900/60 overflow-hidden">

          {toast && (
              <ToastNotification
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
              />
          )}

          {serverError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mb-6">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-sm font-black text-slate-100 mb-2">서버 연결에 실패했습니다</h2>
                <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-xs">
                  분실물 데이터를 불러오지 못했습니다.<br />잠시 후 다시 시도해주세요.
                </p>
                <button
                    onClick={() => setRefreshTrigger(p => p + 1)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center gap-2 text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>다시 시도</span>
                </button>
              </div>
          ) : (
              <>
                {/* 헤더 영역 디자인 개편 */}
                <header className="sticky top-0 bg-[#090d16]/90 backdrop-blur-xl px-5 py-4 border-b border-slate-900/60 z-30 flex justify-between items-center shrink-0">
                  <div
                      className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                      onClick={() => { setView("list"); setSelectedItem(null); }}
                  >
                    {/* 오남고 마크 전용 둥근 컨테이너 플레이스홀더 (300x300 원본 비율 유지 가공) */}
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <img
                          src={logo}
                          alt="오남고"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // 로고 로드 실패 시 깨지는 기본 아이콘 방지용 롤백 필터 처리
                            e.currentTarget.style.display = 'none';
                          }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-500 tracking-wide leading-none mb-1">오남고등학교</span>
                      <h1 className="text-sm font-black tracking-tight text-slate-100 leading-none">
                        찾아드립니다
                      </h1>
                    </div>
                  </div>

                  {view === "list" && (
                      <button
                          onClick={() => setView("create")}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 transition-all duration-300 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1 shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] border border-indigo-400/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>등록하기</span>
                      </button>
                  )}
                </header>

                <main className="flex-1 overflow-y-auto pb-16 scrollbar-none">
                  {view === "list" ? (
                      <div className="p-4 flex flex-col gap-4">

                        <div className="relative animate-fadeIn stagger-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                              type="text"
                              placeholder="물품명, 습득 장소 등을 검색해보세요"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-xs font-medium text-slate-200 placeholder-slate-500 transition-all duration-300"
                          />
                          {searchTerm && (
                              <button
                                  onClick={() => setSearchTerm("")}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 hover:text-slate-200 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                          )}
                        </div>

                        {/* 동적으로 파싱된 카테고리 렌더링 영역 */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none animate-fadeIn stagger-2">
                          {dynamicCategories.map((cat) => (
                              <button
                                  key={cat}
                                  onClick={() => setSelectedCategory(cat)}
                                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
                                      selectedCategory === cat
                                          ? "bg-indigo-600 text-slate-50 shadow-[0_4px_12px_rgba(79,70,229,0.3)] border border-indigo-400/20"
                                          : "bg-slate-900/40 text-slate-400 border border-slate-900 hover:bg-slate-900/80 hover:text-slate-200"
                                  }`}
                              >
                                {cat}
                              </button>
                          ))}
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-28 text-slate-500">
                              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                              <span className="text-xs font-semibold tracking-wide">데이터를 불러오는 중입니다</span>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20 px-5 bg-slate-900/20 rounded-[28px] border-2 border-dashed border-slate-900/80 animate-fadeIn stagger-3 flex flex-col items-center justify-center">
                              <div className="w-14 h-14 bg-slate-900/60 rounded-3xl flex items-center justify-center border border-slate-800/80 mb-4 text-slate-500">
                                <FileText className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-bold text-slate-300">등록된 분실물이 없습니다</p>
                              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed max-w-60">
                                찾고 있는 물품이 없다면, 하단의 버튼을 통해 직접 분실물 정보를 공유해보세요.
                              </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3.5 animate-fadeIn stagger-3">
                              {filteredItems.map((item) => (
                                  <div
                                      key={item.id}
                                      onClick={() => setSelectedItem(item)}
                                      className="group bg-slate-900/30 hover:bg-slate-900/80 p-4 rounded-3xl border border-slate-900 hover:border-indigo-500/30 cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-300 flex gap-4"
                                  >
                                    <div className="w-20 h-20 rounded-2xl bg-slate-950 shrink-0 overflow-hidden relative border border-slate-900 flex items-center justify-center">
                                      {item.images && item.images.length > 0 && item.images[0]?.trim() !== "" ? (
                                          <ServerImg
                                              fileId={item.images[0]}
                                              alt={item.title}
                                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                          />
                                      ) : (
                                          <div className="text-slate-650 flex flex-col items-center justify-center text-center p-1">
                                            <ImageIcon className="w-4 h-4 mb-0.5 text-slate-700" />
                                            <span className="text-[7px] leading-tight font-semibold text-slate-500">이미지 없음</span>
                                          </div>
                                      )}
                                      <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase shadow-md ${
                                          item.status === "FINDING"
                                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                      }`}>
                                                            {item.status === "FINDING" ? "찾는 중" : "수령 완료"}
                                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                      <div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">{item.category}</span>
                                          <span className="text-[8px] text-slate-600 font-medium">
                                                                    {new Date(item.foundAt * 1000).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                                                                </span>
                                        </div>
                                        <h3 className="font-extrabold text-xs text-slate-100 line-clamp-1 mt-1 group-hover:text-indigo-400 transition-colors">
                                          {item.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                          <span className="truncate">{item.foundLocation}</span>
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-2.5">
                                        {item.features.slice(0, 2).map((feat, idx) => (
                                            <span key={idx} className="text-[8px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded-md font-bold border border-slate-800/80">
                                                                    #{feat}
                                                                </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  ) : (
                      <LostItemFormView
                          onSuccess={() => {
                            setView("list");
                            setRefreshTrigger(p => p + 1);
                          }}
                          onCancel={() => setView("list")}
                          triggerToast={triggerToast}
                      />
                  )}
                </main>

                <footer className="absolute bottom-0 left-0 right-0 h-16 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-900/80 flex justify-around items-center z-30 px-6">
                  <button
                      onClick={() => { setView("list"); setSelectedItem(null); }}
                      className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                          view === "list" ? "text-indigo-400" : "text-slate-600 hover:text-slate-400"
                      }`}
                  >
                    <FileText className="w-5.5 h-5.5" />
                    <span>분실물 목록</span>
                  </button>

                  <button
                      onClick={() => setView("create")}
                      className={`flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                          view === "create" ? "text-indigo-400" : "text-slate-600 hover:text-slate-400"
                      }`}
                  >
                    <div className={`p-1 rounded-full border transition-all duration-300 ${
                        view === "create" ? "border-indigo-500 bg-indigo-500/20" : "border-slate-800 bg-slate-900/40"
                    }`}>
                      <Plus className="w-4.5 h-4.5" />
                    </div>
                    <span>분실물 등록</span>
                  </button>
                </footer>

                {selectedItem && (
                    <ItemDetailModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        triggerToast={triggerToast}
                    />
                )}
              </>
          )}
        </div>
      </div>
  );
}