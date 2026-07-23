import * as React from "react";
import { useState } from "react";

import axios from "axios";
import { Plus, X, Sparkles } from "lucide-react";
import { BACKEND_ADDRESS } from "../App";

// 1. 정의하신 enum 기반의 맵 선언 (Value -> Label)
const CATEGORY_MAP = {
	ELECTRONICS: "전자기기",
	WALLET: "지갑·카드",
	VALUEABLES: "귀중품",
	CLOTHING: "의류·잡화",
	BAGS: "가방·소지품",
	DOCUMENTS: "도서·서류",
	FOODS: "식품",
	OTHERS: "기타",
} as const;

interface FormViewProps {
	onSuccess: () => void;
	onCancel: () => void;
	triggerToast: (msg: string, type?: "success" | "error") => void;
}

export function LostItemFormView({ onSuccess, onCancel, triggerToast }: FormViewProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState<string>("");

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			setSelectedImages((prev) => [...prev, ...filesArray]);

			const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
			setPreviewUrls((prev) => [...prev, ...newPreviews]);
		}
	};

	const removeImage = (index: number) => {
		setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
		URL.revokeObjectURL(previewUrls[index]);
		setPreviewUrls((prev) => prev.filter((_, idx) => idx !== index));
	};

	const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const cleaned = tagInput.trim().replace(/^#/, "");
			if (cleaned && !tags.includes(cleaned)) {
				setTags([...tags, cleaned]);
				setTagInput("");
			}
		}
	};

	const handleRemoveTag = (idx: number) => {
		setTags(tags.filter((_, i) => i !== idx));
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { // React.SubmitEvent 오류 수정
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);

		const title = formData.get("title") as string;
		const foundLocation = formData.get("foundLocation") as string;

		if (!title.trim()) return triggerToast("물품명을 입력해주세요.", "error");
		if (!foundLocation.trim()) return triggerToast("습득 장소를 입력해주세요.", "error");

		try {
			setIsSubmitting(true);
			formData.append("foundAt", String(Math.floor(Date.now() / 1000)));
			formData.append("features", JSON.stringify(tags));

			// 기존 storageLocation으로 들어간 필드를 백엔드 스키마 명세인 findMethod로 변환하여 전송
			const storageLocation = formData.get("storageLocation") as string;
			formData.append("findMethod", storageLocation);
			formData.delete("storageLocation");

			selectedImages.forEach((img) => {
				formData.append("images", img);
			});

			await axios.post(`${BACKEND_ADDRESS}lostitems`, formData);
			triggerToast("분실물이 성공적으로 등록되었습니다.");
			onSuccess();
		} catch (err) {
			console.error(err);
			triggerToast("등록 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-5 animate-fadeIn">
			<div className="flex justify-between items-center mb-6 border-b border-slate-900 pb-4">
				<h2 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-1.5">
					<Sparkles className="w-4 h-4 text-indigo-400" />
					<span>신규 분실물 등록</span>
				</h2>
				<button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors p-1 text-xs font-bold">
					취소
				</button>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">

				{/* 이미지 업로드 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
						실물 사진 (다중 선택 가능)
					</label>
					<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
						<label className="w-20 h-20 bg-slate-900/40 hover:bg-slate-900/70 transition-colors rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer shrink-0">
							<Plus className="w-5 h-5 text-indigo-400 mb-0.5" />
							<span className="text-[8px] text-slate-400 font-bold">사진 추가</span>
							<input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
						</label>
						{previewUrls.map((url, index) => (
							<div key={index} className="w-20 h-20 rounded-2xl bg-slate-950 relative shrink-0 overflow-hidden border border-slate-900">
								<img src={url} alt="미리보기" className="w-full h-full object-cover" />
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute top-1 right-1 bg-slate-950/80 text-white p-1 rounded-full hover:bg-slate-950"
								>
									<X className="w-2.5 h-2.5" />
								</button>
							</div>
						))}
					</div>
				</div>

				{/* 종류 (Enum 카테고리 일치 완료) */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">물품 종류</label>
					<select
						name="category"
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs font-bold text-slate-200 outline-none transition-all"
					>
						{Object.entries(CATEGORY_MAP).map(([key, value]) => (
							<option key={key} value={key} className="bg-slate-950">
								{value}
							</option>
						))}
					</select>
				</div>

				{/* 제목 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">글 제목</label>
					<input
						type="text"
						name="title"
						placeholder="예) 학생회관 2층 동아리방 앞 빨간 카드지갑"
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
					/>
				</div>

				{/* 장소 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">습득 장소</label>
					<input
						type="text"
						name="foundLocation"
						placeholder="예) 공학관 3층 복도 소파 구석 사이"
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
					/>
				</div>

				{/* 태그 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">결정적 키워드 (해시태그)</label>
					<div className="flex flex-wrap gap-1.5 mb-2.5">
						{tags.map((tag, idx) => (
							<span key={idx} className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 font-bold px-2 py-1 rounded-xl text-[9px] border border-indigo-500/10">
                   #{tag}
								<button type="button" onClick={() => handleRemoveTag(idx)} className="p-0.5 hover:bg-indigo-500/10 rounded-full">
                      <X className="w-2 h-2" />
                    </button>
                 </span>
						))}
					</div>
					<input
						type="text"
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={handleAddTag}
						placeholder="브랜드명, 케이스 색상 등 (입력 후 Enter 혹은 반점)"
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
					/>
				</div>

				{/* 찾아가는 법 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">보관 위치 / 수령 방법</label>
					<input
						type="text"
						name="storageLocation"
						placeholder="예) 공학관 경비실에 맡겨두었습니다."
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
					/>
				</div>

				{/* 상세 설명 */}
				<div>
					<label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">상세 내용 (선택)</label>
					<textarea
						name="content"
						rows={4}
						placeholder="주인이 물건을 쉽게 식별할 수 있도록 세부적인 특징이나 내부 힌트를 적어주세요."
						className="w-full p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all resize-none"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 active:scale-95 transition-all duration-300 font-extrabold rounded-2xl text-xs tracking-wider shadow-[0_4px_25px_rgba(79,70,229,0.2)] text-white"
				>
					{isSubmitting ? "데이터 처리 중..." : "분실물 등록 완료"}
				</button>
			</form>
		</div>
	);
}