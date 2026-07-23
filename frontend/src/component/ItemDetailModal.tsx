import { useState } from "react";
import { X, MapPin, Calendar, Info, Copy, Image as ImageIcon, Maximize2 } from "lucide-react";
import { type LostItem } from "../App";
import { ServerImg } from "./ServerImg";

interface DetailModalProps {
	item: LostItem;
	onClose: () => void;
	triggerToast: (msg: string, type?: "success" | "error") => void;
}

export function ItemDetailModal({ item, onClose, triggerToast }: DetailModalProps) {
	const [activeImgIndex, setActiveImgIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);

	const formattedDate = new Date(item.foundAt * 1000).toLocaleString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});

	const handleCopyMethod = async () => {
		try {
			await navigator.clipboard.writeText(item.findMethod);
			triggerToast("수령 안내 정보가 복사되었습니다.");
		} catch (err) {
			console.error("복사 실패:", err);
			triggerToast("복사에 실패했습니다.", "error");
		}
	};

	const hasImages = item.images && item.images.length > 0 && item.images.some(img => img && img.trim() !== "");

	return (
		<div className="fixed inset-0 bg-slate-950/80 z-50 flex items-end justify-center backdrop-blur-md" onClick={onClose}>

			{/* 바텀 시트 다이얼로그 */}
			<div
				className="bg-[#090d16] w-full max-w-md rounded-t-4xl max-h-[85vh] flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.8)] relative border-t border-slate-900/60 animate-slideUp overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* 상단 드래그 바 형태 헤더 */}
				<div className="p-4 pb-2 border-b border-slate-900/40 flex flex-col items-center relative z-20 shrink-0 bg-[#090d16]">
					<div className="w-10 h-1 bg-slate-800 rounded-full mb-3 cursor-pointer" onClick={onClose} />
					<button
						onClick={onClose}
						className="absolute top-3.5 right-4 text-slate-500 hover:text-slate-300 p-1.5 transition-all bg-slate-900/40 hover:bg-slate-900/80 rounded-full border border-slate-800/60"
					>
						<X className="w-4 h-4" />
					</button>
					<span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">상세 정보</span>
				</div>

				{/* 내용 스크롤 영역 */}
				<div className="overflow-y-auto p-5 flex flex-col gap-5 text-xs scrollbar-none">

					{/* 캐러셀 이미지 영역 */}
					<div
						onClick={() => hasImages && setIsZoomed(true)}
						className={`group w-full rounded-2xl overflow-hidden aspect-video relative border border-slate-950 flex items-center justify-center ${
							hasImages ? "bg-slate-950 cursor-zoom-in" : "bg-slate-900/20"
						}`}
					>
						{hasImages ? (
							<>
								<ServerImg
									fileId={item.images[activeImgIndex]}
									alt={item.title}
									className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
								/>
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
									<Maximize2 className="w-4 h-4 animate-scalePulse" />
									<span className="text-[10px] font-bold">확대해서 보기</span>
								</div>

								{item.images.length > 1 && (
									<div
										className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-full border border-slate-800/80"
										onClick={(e) => e.stopPropagation()}
									>
										{item.images.map((_, idx) => (
											<button
												key={idx}
												onClick={() => setActiveImgIndex(idx)}
												className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
													activeImgIndex === idx ? "bg-indigo-500 w-3.5" : "bg-slate-600"
												}`}
											/>
										))}
									</div>
								)}
							</>
						) : (
							<div className="text-slate-500 flex flex-col items-center justify-center p-6 text-center">
								<div className="w-11 h-11 bg-slate-950/60 rounded-2xl flex items-center justify-center border border-slate-900/60 mb-2.5">
									<ImageIcon className="w-4 h-4 text-slate-600" />
								</div>
								<span className="text-[11px] font-bold text-slate-400">등록된 이미지가 없습니다</span>
							</div>
						)}
					</div>

					{/* 카테고리 및 타이틀 */}
					<div>
              <span className="inline-block bg-indigo-500/10 text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-lg text-[9px] border border-indigo-500/10 mb-2 uppercase">
                {item.category}
              </span>
						<h2 className="text-sm font-black text-slate-100 tracking-tight leading-snug">{item.title}</h2>
					</div>

					{/* 정보 카드 */}
					<div className="grid grid-cols-1 gap-3 bg-slate-900/20 p-4 rounded-2xl border border-slate-900/60">
						<div className="flex items-center gap-2.5 text-slate-300">
							<MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
							<span className="font-bold text-slate-500">습득 장소:</span>
							<span className="text-slate-200 font-bold truncate">{item.foundLocation}</span>
						</div>
						<div className="flex items-center gap-2.5 text-slate-300">
							<Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
							<span className="font-bold text-slate-500">습득 일시:</span>
							<span className="text-slate-200 font-bold">{formattedDate}</span>
						</div>
					</div>

					{/* 특징 태그 */}
					{item.features && item.features.length > 0 && (
						<div>
							<h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">물품 특징</h4>
							<div className="flex flex-wrap gap-1.5">
								{item.features.map((feat, idx) => (
									<span key={idx} className="bg-slate-900/60 border border-slate-800/80 text-indigo-300 px-2 py-1 rounded-lg text-[9px] font-bold">
                          #{feat}
                        </span>
								))}
							</div>
						</div>
					)}

					{/* 상세 내용 */}
					<div>
						<h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">상세 내용</h4>
						<p className="bg-slate-900/20 p-4 rounded-2xl text-slate-300 leading-relaxed font-medium border border-slate-900/60 whitespace-pre-wrap">
							{item.content || "추가 상세 정보가 기재되지 않았습니다."}
						</p>
					</div>

					{/* 수령 방법 안내 */}
					<div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-3">
						<div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/10">
							<Info className="w-4 h-4" />
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-0.5">현재 보관 위치 및 수령 방법</h4>
							<p className="text-[10px] text-slate-300 font-bold leading-relaxed">{item.findMethod || "보관 방식 정보가 등록되지 않았습니다."}</p>
						</div>
						{item.findMethod && (
							<button
								onClick={handleCopyMethod}
								className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all active:scale-95 shrink-0"
								title="복사하기"
							>
								<Copy className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					<button
						onClick={onClose}
						className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-slate-50 font-extrabold rounded-2xl transition-all active:scale-95 text-center text-xs tracking-wider border border-indigo-500/20 shadow-md shadow-indigo-500/10"
					>
						확인
					</button>
				</div>
			</div>

			{/* 라이트박스 오버레이 이미지 뷰어 */}
			{isZoomed && hasImages && (
				<div
					className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn cursor-zoom-out"
					onClick={() => setIsZoomed(false)}
				>
					<div className="relative max-w-full max-h-[85vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-slate-900" onClick={(e) => e.stopPropagation()}>
						<ServerImg
							fileId={item.images[activeImgIndex]}
							alt={item.title}
							className="max-w-full max-h-[85vh] object-contain rounded-3xl"
						/>
						<button
							onClick={() => setIsZoomed(false)}
							className="absolute top-4 right-4 bg-slate-900/90 text-white p-2.5 rounded-full hover:bg-slate-800 border border-slate-700/50 active:scale-95 transition-all"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}