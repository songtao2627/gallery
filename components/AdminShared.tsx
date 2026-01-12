import React, { ReactNode } from 'react';

/**
 * Reusable backdrop and wrapper for Modals.
 * Providing a unified "Glassmorphism" look with animations.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidthClass = 'max-w-6xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div
                className={`relative w-full ${maxWidthClass} h-auto max-h-[90vh] bg-[#0f172a]/60 backdrop-blur-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 transition-all duration-500 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 ring-1 ring-white/10`}
                style={{
                    boxShadow: '0 0 80px -20px var(--theme-title), inset 0 0 0 1px rgba(255,255,255,0.1)', // Dynamic Glow + Inner Rim
                }}
            >
                {/* Decorative Gradient Line */}
                <div className="h-1 w-full flex-none bg-gradient-to-r from-transparent via-[var(--theme-title)] to-transparent opacity-80"></div>

                {children}
            </div>
        </div>
    );
};

interface ModalHeaderProps {
    title: string;
    subtitle?: ReactNode;
    icon?: string; // Material symbol name
    onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, icon, onClose }) => {
    return (
        <div className="relative flex-none flex justify-between items-center px-10 py-6 border-b border-white/5 bg-white/[0.02]">
            <div>
                <h2
                    className="text-3xl font-display font-black tracking-tight drop-shadow-sm flex items-center gap-3"
                    style={{ color: 'var(--theme-title)' }}
                >
                    {icon && (
                        <span className="material-symbols-rounded text-4xl opacity-80">
                            {icon}
                        </span>
                    )}
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide pl-1">
                        {subtitle}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="group p-3 rounded-full hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300"
            >
                <span className="material-symbols-rounded text-2xl text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all">close</span>
            </button>
        </div>
    );
};

// --- Form Elements ---

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
}

export const StyledInput: React.FC<StyledInputProps> = ({ label, icon, className = '', ...props }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 material-symbols-rounded text-lg pointer-events-none">
                    {icon}
                </span>
            )}
            <input
                className={`w-full bg-black/20 border border-white/10 rounded-xl ${icon ? 'pl-12' : 'px-4'} pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--theme-title)] focus:ring-1 focus:ring-[var(--theme-title)] transition-all font-medium text-lg ${className}`}
                {...props}
            />
        </div>
    </div>
);

interface StyledActionButtonsProps {
    onCancel: () => void;
    onSubmit?: () => void; // Optional if using type="submit" in form
    submitLabel: string;
    submitIcon?: string;
    isSubmitDisabled?: boolean;
}

export const StyledActionButtons: React.FC<StyledActionButtonsProps> = ({ onCancel, onSubmit, submitLabel, submitIcon, isSubmitDisabled }) => (
    <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
        <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold hover:bg-white/5 transition-all"
        >
            取消
        </button>
        <button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="px-8 py-3 rounded-xl text-black font-black text-sm tracking-wide shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: 'var(--theme-title)', boxShadow: '0 10px 30px -10px var(--theme-title)' }}
        >
            {submitIcon && <span className="material-symbols-rounded">{submitIcon}</span>}
            {submitLabel}
        </button>
    </div>
);

interface StyledTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export const StyledTextArea: React.FC<StyledTextAreaProps> = ({ label, className = '', ...props }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
            {label}
        </label>
        <textarea
            className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--theme-title)] focus:ring-1 focus:ring-[var(--theme-title)] transition-all min-h-[100px] resize-none leading-relaxed ${className}`}
            {...props}
        />
    </div>
);

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
}

export const StyledSelect: React.FC<StyledSelectProps> = ({ label, options, className = '', ...props }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
            {label}
        </label>
        <div className="relative">
            <select
                className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-[var(--theme-title)] focus:ring-1 focus:ring-[var(--theme-title)] transition-all cursor-pointer font-medium ${className}`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-rounded">expand_more</span>
            </div>
        </div>
    </div>
);

interface TagSelectorProps {
    label: string;
    selectedTags: string[];
    availableTags: string[]; // List of tag names
    onChange: (tags: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ label, selectedTags, availableTags, onChange }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Handle outside click to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTags = React.useMemo(() => {
        const term = inputValue.toLowerCase().trim();
        return availableTags
            .filter(t => !selectedTags.includes(t)) // Exclude already selected
            .filter(t => t.toLowerCase().includes(term));
    }, [availableTags, selectedTags, inputValue]);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (!selectedTags.includes(trimmed)) {
            onChange([...selectedTags, trimmed]);
        }
        setInputValue('');
    };

    const removeTag = (tagToRemove: string) => {
        onChange(selectedTags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If typing, add input value
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            // Remove last tag if backspace pressed on empty input
            removeTag(selectedTags[selectedTags.length - 1]);
        } else if (e.key === ',' || e.key === '，') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue.replace(/[,，]/g, ''));
            }
        }
    };

    return (
        <div className="space-y-2 group" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
                {label}
            </label>

            <div className="relative">
                {/* Main Container */}
                <div
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-[var(--theme-title)] focus-within:ring-1 focus-within:ring-[var(--theme-title)] transition-all"
                    onClick={() => {
                        setIsDropdownOpen(true);
                    }}
                >
                    {/* Selected Chips */}
                    {selectedTags.map(tag => (
                        <span
                            key={tag}
                            className="bg-[var(--theme-title)] text-black px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 animate-in zoom-in-50 duration-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                                className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                            >
                                <span className="material-symbols-rounded text-sm">close</span>
                            </button>
                        </span>
                    ))}

                    {/* Input */}
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 flex-1 min-w-[120px] px-2 py-1 font-medium"
                        placeholder={selectedTags.length === 0 ? "输入标签，可搜索或新建..." : ""}
                        value={inputValue}
                        onChange={(e) => {
                            // Handle comma paste or typing
                            if (e.target.value.includes(',') || e.target.value.includes('，')) {
                                const parts = e.target.value.split(/[,，]/);
                                parts.forEach(p => {
                                    if (p.trim()) addTag(p);
                                });
                                setInputValue('');
                            } else {
                                setInputValue(e.target.value);
                            }
                            setIsDropdownOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                </div>

                {/* Dropdown Panel */}
                {isDropdownOpen && (filteredTags.length > 0 || inputValue) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 fade-in">
                        {/* Current Input Create Option (if not in filtered) */}
                        {inputValue.trim() && !filteredTags.some(t => t.toLowerCase() === inputValue.toLowerCase()) && !selectedTags.includes(inputValue.trim()) && (
                            <button
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-white/5 text-blue-400 font-bold border-b border-white/5 flex items-center gap-2"
                                onClick={() => addTag(inputValue)}
                            >
                                <span className="material-symbols-rounded text-lg">add_circle</span>
                                新建标签: "{inputValue}"
                            </button>
                        )}

                        <div className="flex flex-wrap gap-2 p-2">
                            {filteredTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/10"
                                    onClick={() => addTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ICON_CATEGORIES = {
    '操作': [
        'search', 'home', 'settings', 'check', 'close', 'menu', 'add', 'delete', 'edit', 'favorite',
        'star', 'login', 'logout', 'history', 'refresh', 'update', 'delete_forever', 'build', 'cached',
        'help', 'info', 'autorenew', 'visibility', 'visibility_off', 'verified', 'report'
    ],
    '导航': [
        'arrow_back', 'arrow_forward', 'expand_more', 'expand_less', 'chevron_right', 'chevron_left',
        'menu_open', 'apps', 'more_vert', 'more_horiz', 'fullscreen', 'fullscreen_exit'
    ],
    '内容与文件': [
        'article', 'description', 'content_copy', 'content_paste', 'save', 'save_as', 'drafts',
        'archive', 'unarchive', 'folder', 'folder_open', 'upload', 'download', 'cloud_upload', 'cloud_download',
        'attachment', 'link', 'image', 'picture_as_pdf'
    ],
    '状态': [
        'grade', 'thumb_up', 'thumb_down', 'light_mode', 'dark_mode', 'lock', 'lock_open',
        'schedule', 'event', 'today', 'pending', 'circle', 'check_circle', 'error', 'warning'
    ],
    '通讯': [
        'email', 'mail', 'chat', 'chat_bubble', 'forum', 'comment', 'call', 'call_end',
        'person', 'group', 'people', 'share', 'notifications', 'notifications_active', 'send'
    ],
    '多媒体': [
        'play_circle', 'pause_circle', 'stop_circle', 'skip_next', 'skip_previous', 'volume_up', 'volume_off',
        'mic', 'mic_off', 'videocam', 'movie', 'music_note', 'headphones'
    ],
    '设备': [
        'keyboard', 'mouse', 'monitor', 'smartphone', 'phone_iphone', 'laptop', 'desktop_windows', 'tablet',
        'developer_board', 'device_hub', 'router', 'memory'
    ],
    '社交与地点': [
        'public', 'language', 'map', 'place', 'location_on', 'rocket', 'flight', 'local_shipping',
        'school', 'work', 'business', 'store', 'shopping_cart', 'wallet'
    ],
    '编辑与开发': [
        'format_bold', 'format_italic', 'format_underlined', 'format_list_bulleted', 'format_list_numbered',
        'title', 'text_fields', 'code', 'terminal', 'data_object', 'html', 'css', 'javascript',
        'palette', 'brush', 'auto_fix_high', 'crop', 'zoom_in', 'zoom_out'
    ],
    '数据': [
        'dashboard', 'analytics', 'bar_chart', 'pie_chart', 'timeline', 'table_chart', 'grid_view', 'list',
        'api', 'database', 'storage', 'query_stats'
    ]
};


interface IconSelectorProps {
    label: string;
    value: string;
    onChange: (icon: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ label, value, onChange }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (icon: string) => {
        onChange(icon);
        setInputValue('');
        setIsDropdownOpen(false);
    };

    const displayValue = inputValue || value;

    return (
        <div className="space-y-2 group" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
                {label}
            </label>
            <div className="relative">
                <div
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[var(--theme-title)] focus-within:ring-1 focus-within:ring-[var(--theme-title)] transition-all cursor-text"
                    onClick={() => {
                        setIsDropdownOpen(true);
                    }}
                >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-none">
                        <span className="material-symbols-rounded text-xl text-[var(--theme-title)]">
                            {value || 'help_outline'}
                        </span>
                    </div>

                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 flex-1 font-mono text-sm"
                        placeholder="输入图标名称或选择..."
                        value={displayValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            onChange(e.target.value); // Real-time update for preview
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    <span className="material-symbols-rounded text-slate-500">expand_more</span>
                </div>

                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[400px] sm:w-[500px] bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden p-6 animate-in slide-in-from-top-2 fade-in max-h-[400px] overflow-y-auto custom-scrollbar">
                        {Object.entries(ICON_CATEGORIES).map(([category, icons]) => {
                            const filteredIcons = icons.filter(i => i.includes(inputValue.toLowerCase()));
                            if (filteredIcons.length === 0) return null;

                            return (
                                <div key={category} className="mb-6 last:mb-0">
                                    <div className="text-xs font-bold text-[var(--theme-title)] mb-3 uppercase tracking-widest border-b border-white/5 pb-1">
                                        {category}
                                    </div>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                        {filteredIcons.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleSelect(icon); }}
                                                className={`aspect-square rounded-lg flex items-center justify-center hover:bg-white/10 transition-all group/icon relative ${value === icon ? 'bg-[var(--theme-title)] text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                                title={icon}
                                            >
                                                <span className="material-symbols-rounded text-2xl">{icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {inputValue && !Object.values(ICON_CATEGORIES).flat().some(i => i === inputValue) && (
                            <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                <span className="text-slate-400 text-xs text-center block mb-2">Custom Input</span>
                                <div className="inline-flex flex-col items-center p-4 bg-white/5 rounded-xl">
                                    <span className="material-symbols-rounded text-4xl text-[var(--theme-title)] mb-2">{inputValue}</span>
                                    <span className="text-xs font-mono text-slate-300 bg-black/40 px-2 py-1 rounded">{inputValue}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ColorSelectorProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

const PREMIUM_COLORS = [
    { name: 'Slate', value: 'text-slate-400', bg: 'bg-slate-400' },
    { name: 'Red', value: 'text-red-400', bg: 'bg-red-400' },
    { name: 'Orange', value: 'text-orange-400', bg: 'bg-orange-400' },
    { name: 'Amber', value: 'text-amber-400', bg: 'bg-amber-400' },
    { name: 'Yellow', value: 'text-yellow-400', bg: 'bg-yellow-400' },
    { name: 'Lime', value: 'text-lime-400', bg: 'bg-lime-400' },
    { name: 'Green', value: 'text-green-400', bg: 'bg-green-400' },
    { name: 'Emerald', value: 'text-emerald-400', bg: 'bg-emerald-400' },
    { name: 'Teal', value: 'text-teal-400', bg: 'bg-teal-400' },
    { name: 'Cyan', value: 'text-cyan-400', bg: 'bg-cyan-400' },
    { name: 'Sky', value: 'text-sky-400', bg: 'bg-sky-400' },
    { name: 'Blue', value: 'text-blue-400', bg: 'bg-blue-400' },
    { name: 'Indigo', value: 'text-indigo-400', bg: 'bg-indigo-400' },
    { name: 'Violet', value: 'text-violet-400', bg: 'bg-violet-400' },
    { name: 'Purple', value: 'text-purple-400', bg: 'bg-purple-400' },
    { name: 'Fuchsia', value: 'text-fuchsia-400', bg: 'bg-fuchsia-400' },
    { name: 'Pink', value: 'text-pink-400', bg: 'bg-pink-400' },
    { name: 'Rose', value: 'text-rose-400', bg: 'bg-rose-400' },
];

export const ColorSelector: React.FC<ColorSelectorProps> = ({ label, value, onChange }) => {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[var(--theme-title)] transition-colors">
                {label}
            </label>
            <div className="w-full bg-black/20 border border-white/10 rounded-xl p-3 flex flex-wrap gap-2">
                {PREMIUM_COLORS.map((color) => {
                    const isSelected = value === color.value;
                    return (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => onChange(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${isSelected ? 'border-white scale-110 shadow-[0_0_15px_-3px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-110 hover:border-white/50'}`}
                            title={color.name}
                        >
                            <div className={`w-full h-full rounded-full ${color.bg} opacity-80 ${isSelected ? 'opacity-100' : ''}`}></div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
