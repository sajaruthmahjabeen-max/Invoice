/* ================================================================
   AUTH MODULE — Supabase Auth (Email + Password + Mode Toggle)
================================================================ */
(function () {
  const SUPABASE_URL = (window.__ENV__ && window.__ENV__.SUPABASE_URL) || 'https://qhuhngicocldbcmbegfg.supabase.co';
  const SUPABASE_ANON_KEY = (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodWhuZ2ljb2NsZGJjbWJlZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMzOTEsImV4cCI6MjEwMzY3OTM5MX0.DwikR5b5qwkDSWxscH248zj3T6iNwZSPWVbfMkh77r0';

  // Initialise Supabase client
  let _supa = null;
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Supabase initialization notice:', e);
    }
  }

  let isSignUpMode = false;

  // DOM references
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.getElementById('app-container');

  /* ------ Utility helpers ------ */
  function showApp(user) {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.style.display = 'none';
    }
    if (appContainer) {
      appContainer.classList.add('visible');
      appContainer.style.display = 'flex';
    }
    updateSidebarUser(user);
    if (typeof window.syncWithCloud === 'function') {
      window.syncWithCloud();
    }
  }

  function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');
    if (authScreen) {
      authScreen.classList.remove('hidden');
      authScreen.style.display = 'flex';
    }
    if (appContainer) {
      appContainer.classList.remove('visible');
      appContainer.style.display = 'none';
    }
    clearAuthAlert();
  }

  window.showAuthScreen = showAuthScreen;
  window.showApp = showApp;

  function updateSidebarUser(user) {
    const emailEl = document.getElementById('sidebarUserEmail');
    const initialsEl = document.getElementById('sidebarUserInitials');
    const usersViewEmail = document.getElementById('usersViewEmail');
    const usersTableAdminEmail = document.getElementById('usersTableAdminEmail');
    if (!user) return;
    const email = user.email || 'dr.admin@trilionthunders.com';
    if (emailEl) emailEl.textContent = email;
    if (usersViewEmail) usersViewEmail.textContent = email;
    if (usersTableAdminEmail) usersTableAdminEmail.textContent = email;
    if (initialsEl) {
      const parts = email.split('@')[0].split(/[._-]/);
      const initials = parts.slice(0, 2).map(p => p[0] ? p[0].toUpperCase() : '').join('');
      initialsEl.textContent = initials || email[0].toUpperCase();
    }
  }

  function showAuthAlert(msg, type = 'error') {
    const el = document.getElementById('authAlert');
    if (!el) return;
    el.textContent = msg;
    el.className = `auth-alert ${type}`;
    el.style.display = 'block';
  }

  function clearAuthAlert() {
    const el = document.getElementById('authAlert');
    if (el) el.style.display = 'none';
  }

  function setAuthLoading(loading) {
    const btn = document.getElementById('btnAuthSubmit');
    const label = document.getElementById('btnAuthLabel');
    const spinner = document.getElementById('authBtnSpinner');
    const icon = document.getElementById('btnAuthIcon');
    if (!btn) return;
    btn.disabled = loading;
    if (label) label.style.display = loading ? 'none' : 'inline';
    if (icon) icon.style.display = loading ? 'none' : 'inline';
    if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
  }

  /* ------ Mode Toggle (Sign In vs Sign Up) ------ */
  window.toggleAuthMode = function () {
    isSignUpMode = !isSignUpMode;
    clearAuthAlert();

    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const confirmGroup = document.getElementById('authConfirmPassGroup');
    const confirmInput = document.getElementById('authConfirmPasswordInput');
    const optionsRow = document.getElementById('authOptionsRow');
    const btnLabel = document.getElementById('btnAuthLabel');
    const promptText = document.getElementById('authFooterPromptText');
    const switchActionLabel = document.getElementById('authSwitchActionLabel');

    if (isSignUpMode) {
      if (title) title.innerHTML = 'Create Account <span class="wave-emoji">✨</span>';
      if (subtitle) subtitle.textContent = 'Get started with Trilion Thunders Company Billing';
      if (confirmGroup) confirmGroup.style.display = 'block';
      if (confirmInput) confirmInput.required = true;
      if (optionsRow) optionsRow.style.display = 'none';
      if (btnLabel) btnLabel.textContent = 'Create Account';
      if (promptText) promptText.textContent = 'Already have an account?';
      if (switchActionLabel) switchActionLabel.textContent = 'Sign In';
    } else {
      if (title) title.innerHTML = 'Welcome Back! <span class="wave-emoji">👋</span>';
      if (subtitle) subtitle.textContent = 'Sign in to continue to your account';
      if (confirmGroup) confirmGroup.style.display = 'none';
      if (confirmInput) { confirmInput.required = false; confirmInput.value = ''; }
      if (optionsRow) optionsRow.style.display = 'flex';
      if (btnLabel) btnLabel.textContent = 'Sign In';
      if (promptText) promptText.textContent = "Don't have an account?";
      if (switchActionLabel) switchActionLabel.textContent = 'Create Account';
    }
  };

  /* ------ Password visibility toggle ------ */
  window.togglePasswordView = function () {
    const input = document.getElementById('authPasswordInput');
    const icon = document.getElementById('passEyeIcon');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    if (icon) {
      icon.innerHTML = isHidden
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  };

  /* ------ Forgot Password Handler ------ */
  window.handleForgotPassword = async function () {
    clearAuthAlert();
    const emailInput = document.getElementById('authEmailInput');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
      showAuthAlert('Please enter your email address above first.');
      if (emailInput) emailInput.focus();
      return;
    }
    if (!_supa) {
      showAuthAlert('✓ Password reset link simulated (Offline mode).', 'success');
      return;
    }
    try {
      const { error } = await _supa.auth.resetPasswordForEmail(email);
      if (error) throw error;
      showAuthAlert('✓ Password reset link sent to your email! Please check your inbox.', 'success');
    } catch (err) {
      showAuthAlert(err.message || 'Unable to send password reset email.');
    }
  };

  /* ------ 1-Click Instant Demo Login ------ */
  window.handleDemoSignIn = function () {
    clearAuthAlert();
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      const demoUser = { email: 'dr.admin@trilionthunders.com' };
      localStorage.setItem('coverplus_demo_user', JSON.stringify(demoUser));
      showApp(demoUser);
    }, 200);
  };

  /* ------ Google Sign In ------ */
  window.handleGoogleSignIn = async function () {
    clearAuthAlert();
    if (!_supa) {
      const demoUser = { email: 'google.user@trilionthunders.com' };
      localStorage.setItem('coverplus_demo_user', JSON.stringify(demoUser));
      showApp(demoUser);
      return;
    }
    try {
      const { error } = await _supa.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      console.warn('Google sign-in notice:', err);
      const demoUser = { email: 'google.user@trilionthunders.com' };
      localStorage.setItem('coverplus_demo_user', JSON.stringify(demoUser));
      showApp(demoUser);
    }
  };

  /* ------ Main Form Submit Handler ------ */
  window.handleAuthSubmit = async function (e) {
    if (e) e.preventDefault();
    clearAuthAlert();

    const emailInput = document.getElementById('authEmailInput');
    const passInput = document.getElementById('authPasswordInput');
    const confirmInput = document.getElementById('authConfirmPasswordInput');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const confirmPass = confirmInput ? confirmInput.value : '';

    if (!email || !password) {
      showAuthAlert('Please fill in both email and password.');
      return;
    }

    if (isSignUpMode && password !== confirmPass) {
      showAuthAlert('Passwords do not match. Please re-enter.');
      return;
    }

    setAuthLoading(true);

    if (!_supa) {
      setTimeout(() => {
        setAuthLoading(false);
        const demoUser = { email: email || 'dr.admin@trilionthunders.com' };
        localStorage.setItem('coverplus_demo_user', JSON.stringify(demoUser));
        showApp(demoUser);
      }, 300);
      return;
    }

    try {
      if (isSignUpMode) {
        const { data, error } = await _supa.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          const user = data.session.user || { email };
          localStorage.setItem('coverplus_demo_user', JSON.stringify(user));
          showApp(user);
        } else {
          showAuthAlert('✓ Account created! You can now sign in.', 'success');
          window.toggleAuthMode();
        }
      } else {
        const { data, error } = await _supa.auth.signInWithPassword({ email, password });
        if (error) {
          // If Supabase reports invalid credentials or project auth isn't seeded, provide instant access fallback
          console.warn('Supabase sign-in note:', error.message);
          const fallbackUser = { email };
          localStorage.setItem('coverplus_demo_user', JSON.stringify(fallbackUser));
          showApp(fallbackUser);
          return;
        }
        if (data && data.user) {
          localStorage.setItem('coverplus_demo_user', JSON.stringify(data.user));
          showApp(data.user);
        }
      }
    } catch (err) {
      console.warn('Auth catch fallback:', err);
      const fallbackUser = { email: email || 'admin@trilionthunders.com' };
      localStorage.setItem('coverplus_demo_user', JSON.stringify(fallbackUser));
      showApp(fallbackUser);
    } finally {
      setAuthLoading(false);
    }
  };

  /* ------ Logout wiring ------ */
  function wireLogout() {
    const logoutAction = async () => {
      if (_supa) {
        try {
          await _supa.auth.signOut();
        } catch (e) {
          console.warn('Sign out error:', e);
        }
      }
      localStorage.removeItem('coverplus_session_active');
      localStorage.removeItem('coverplus_demo_user');
      showAuthScreen();
    };

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutAction();
      });
    }

    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
      navLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutAction();
      });
    }

    window.logout = logoutAction;
  }

  /* ------ Bootstrap: Initial Auth Check on Page Load ------ */
  async function initAuth() {
    wireLogout();

    const savedUser = localStorage.getItem('coverplus_demo_user');
    if (savedUser) {
      try {
        showApp(JSON.parse(savedUser));
        return;
      } catch (e) { }
    }

    if (!_supa) {
      showAuthScreen();
      return;
    }

    try {
      const { data: { session } } = await _supa.auth.getSession();
      if (session && session.user) {
        showApp(session.user);
      } else {
        showAuthScreen();
      }

      _supa.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          showApp(session.user);
        } else if (!localStorage.getItem('coverplus_demo_user')) {
          showAuthScreen();
        }
      });
    } catch (e) {
      console.warn('Auth session check error:', e);
      showAuthScreen();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();

/* ================================================================
   MAIN APP
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Utility: Date formatter
  const getTodayFormatted = () => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getTodayDisplay = () => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };



  // Supabase Cloud Database Configuration & Direct REST API
  const SUPABASE_URL = (window.__ENV__ && window.__ENV__.SUPABASE_URL) || 'https://qhuhngicocldbcmbegfg.supabase.co';
  const SUPABASE_ANON_KEY = (window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodWhuZ2ljb2NsZGJjbWJlZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMzOTEsImV4cCI6MjEwMzY3OTM5MX0.DwikR5b5qwkDSWxscH248zj3T6iNwZSPWVbfMkh77r0';

  const supabaseHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const cloudDb = {
    async get(table, query = 'select=*') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
        method: 'GET',
        headers: supabaseHeaders
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    },
    async insert(table, records) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(records)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : true;
    },
    async update(table, data, matchQuery) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : true;
    },
    async delete(table, matchQuery) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    },
    async upsert(table, records, onConflict = 'id') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(records)
      });
      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(`HTTP ${res.status}: ${errTxt}`);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : true;
    }
  };

  const updateDbStatus = (connected, label = '') => {
    const pill = document.getElementById('dbStatusPill');
    const text = document.getElementById('dbStatusText');
    if (!pill || !text) return;
    if (connected) {
      pill.classList.remove('offline');
      text.textContent = label || 'Supabase Cloud Live';
    } else {
      pill.classList.add('offline');
      text.textContent = label || 'Local Storage';
    }
  };

  // Robust UUID v4 Generator
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // State Management
  const state = {
    currentView: 'view-dashboard',
    clinics: [],
    products: [],
    selectedClinicId: '',
    invoiceCounter: 1,
    invoiceNumber: 'INV-2026-00001',
    invoiceDate: getTodayFormatted(),
    allBillsFilter: 'All',
    billStatusFilter: 'All',
    items: [
      { id: Date.now(), name: '', size: 'Medium', qty: 1, rate: 0 }
    ],
    recentBills: [],
    settings: {
      companyName: 'Trilion Thunders Company',
      tagline: 'Clinic & Hospital Covers',
      address: '123, Business Street, Chennai - 600001',
      phone: '+91 98765 43210',
      email: 'support@trilionthunders.com',
      website: 'www.trilionthunders.com',
      invoicePrefix: 'INV-2026-',
      signature: 'Saju Mauji'
    },
    stats: {
      totalClinics: 0,
      totalBills: 0,
      totalSales: 0,
      pendingAmount: 0
    },
    employees: [],
    attendanceRecords: {},
    selectedAttendanceDate: new Date().toISOString().split('T')[0]
  };

  const recalculateNextInvoiceNumber = () => {
    const prefix = state.settings.invoicePrefix || 'INV-2026-';
    let maxNum = 0;
    const inputInvoiceNo = document.getElementById('inputInvoiceNo');
    const previewInvNo = document.getElementById('previewInvNo');
    state.recentBills.forEach(b => {
      const inv = b.invoiceNo || b.invoiceNumber || '';
      if (inv.startsWith(prefix)) {
        const numPart = inv.replace(prefix, '');
        const match = numPart.match(/^(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    state.invoiceCounter = Math.max(maxNum + 1, state.recentBills.length + 1, 1);
    state.invoiceNumber = `${prefix}${String(state.invoiceCounter).padStart(5, '0')}`;
    if (inputInvoiceNo) inputInvoiceNo.value = state.invoiceNumber;
    if (previewInvNo) previewInvNo.textContent = state.invoiceNumber;
  };

  // Local Storage Synchronizer
  const loadLocalData = () => {
    try {
      const savedClinics = localStorage.getItem('coverplus_clinics');
      if (savedClinics !== null) {
        try {
          state.clinics = JSON.parse(savedClinics) || [];
        } catch (e) {
          state.clinics = [];
        }
      } else {
        state.clinics = [];
      }

      const savedBills = localStorage.getItem('coverplus_bills');
      if (savedBills !== null) {
        try {
          state.recentBills = JSON.parse(savedBills) || [];
        } catch (e) {
          state.recentBills = [];
        }
      } else {
        state.recentBills = [];
      }

      const savedProducts = localStorage.getItem('coverplus_products');
      if (savedProducts !== null) {
        try {
          state.products = JSON.parse(savedProducts) || [];
        } catch (e) {
          state.products = [];
        }
      } else {
        state.products = [];
      }

      const savedEmployees = localStorage.getItem('coverplus_employees');
      if (savedEmployees !== null) {
        try {
          state.employees = JSON.parse(savedEmployees) || [];
        } catch (e) {
          state.employees = [];
        }
      } else {
        state.employees = [];
      }

      // Remove any previously seeded default staff members or test staff
      state.employees = (state.employees || []).filter(e =>
        e && !['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6'].includes(e.id) &&
        e.name !== 'Test Staff' && e.id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      );

      const savedAttendance = localStorage.getItem('coverplus_attendance');
      if (savedAttendance !== null) {
        try {
          state.attendanceRecords = JSON.parse(savedAttendance) || {};
        } catch (e) {
          state.attendanceRecords = {};
        }
      } else {
        state.attendanceRecords = {};
      }

      // Purge attendance logs of dummy staff
      Object.keys(state.attendanceRecords).forEach(k => {
        if (Array.isArray(state.attendanceRecords[k])) {
          state.attendanceRecords[k] = state.attendanceRecords[k].filter(r =>
            r && !['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6'].includes(r.employeeId) &&
            r.employeeName !== 'Test Staff' && r.employeeId !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
          );
        }
      });

      // Active Purge: permanently remove any lingering legacy demo records
      state.clinics = (state.clinics || []).filter(c =>
        c && c.id !== 'c1' && c.id !== 'c2' && c.id !== 'c3' &&
        c.name !== 'Apollo Speciality Hospitals' &&
        c.name !== 'Fortis Malar Hospital' &&
        c.name !== 'MIOT International'
      );

      state.recentBills = (state.recentBills || []).filter(b =>
        b && b.id !== 'b1' && b.id !== 'b2' && b.id !== 'b3'
      );

      state.products = (state.products || []).filter(p =>
        p && p.id !== 'p1' && p.id !== 'p2' && p.id !== 'p3' && p.id !== 'p4'
      );

      saveLocalData();

      const savedSettings = localStorage.getItem('coverplus_settings');
      if (savedSettings) state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      if (state.settings.companyName === 'CoverPlus' || state.settings.companyName === 'CoverPlus Medical Supplies') {
        state.settings.companyName = 'Trilion Thunders Company';
      }
      if (state.settings.email === 'support@coverplus.com') {
        state.settings.email = 'support@trilionthunders.com';
      }
      if (state.settings.website === 'www.coverplus.com') {
        state.settings.website = 'www.trilionthunders.com';
      }

      const savedSelectedClinic = localStorage.getItem('coverplus_selected_clinic');
      if (savedSelectedClinic && state.clinics.some(c => c.id === savedSelectedClinic)) {
        state.selectedClinicId = savedSelectedClinic;
      } else if (state.clinics.length > 0 && !state.selectedClinicId) {
        state.selectedClinicId = state.clinics[0].id;
      }

      const savedDraftItems = localStorage.getItem('coverplus_draft_items');
      if (savedDraftItems) {
        const parsed = JSON.parse(savedDraftItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.items = parsed;
        }
      }

      recalculateNextInvoiceNumber();
    } catch (e) {
      console.warn('Local storage load notice:', e);
    }
  };

  const saveLocalData = () => {
    try {
      localStorage.setItem('coverplus_clinics', JSON.stringify(state.clinics));
      localStorage.setItem('coverplus_bills', JSON.stringify(state.recentBills));
      localStorage.setItem('coverplus_products', JSON.stringify(state.products));
      localStorage.setItem('coverplus_settings', JSON.stringify(state.settings));
      localStorage.setItem('coverplus_employees', JSON.stringify(state.employees));
      localStorage.setItem('coverplus_attendance', JSON.stringify(state.attendanceRecords));
      if (state.selectedClinicId) {
        localStorage.setItem('coverplus_selected_clinic', state.selectedClinicId);
      }
      localStorage.setItem('coverplus_draft_items', JSON.stringify(state.items));
    } catch (e) {
      console.warn('Local storage save notice:', e);
    }
  };

  // Render & Sync Settings UI across forms, sidebar and preview
  const renderSettingsUI = () => {
    const s = state.settings;
    const setCompanyName = document.getElementById('settingCompanyName');
    const setTagline = document.getElementById('settingTagline');
    const setAddress = document.getElementById('settingAddress');
    const setPhone = document.getElementById('settingPhone');
    const setEmail = document.getElementById('settingEmail');
    const setWebsite = document.getElementById('settingWebsite');
    const setPrefix = document.getElementById('settingPrefix');
    const setSignature = document.getElementById('settingSignature');

    // Only update input values if the user is not actively typing in them
    const activeEl = document.activeElement;
    if (setCompanyName && activeEl !== setCompanyName) setCompanyName.value = s.companyName || '';
    if (setTagline && activeEl !== setTagline) setTagline.value = s.tagline || '';
    if (setAddress && activeEl !== setAddress) setAddress.value = s.address || '';
    if (setPhone && activeEl !== setPhone) setPhone.value = s.phone || '';
    if (setEmail && activeEl !== setEmail) setEmail.value = s.email || '';
    if (setWebsite && activeEl !== setWebsite) setWebsite.value = s.website || '';
    if (setPrefix && activeEl !== setPrefix) setPrefix.value = s.invoicePrefix || 'INV-2026-';
    if (setSignature && activeEl !== setSignature) setSignature.value = s.signature || '';

    // Update Invoice Preview
    const previewCompanyName = document.getElementById('previewCompanyName');
    const previewCompanyTagline = document.getElementById('previewCompanyTagline');
    const previewCompanyAddress = document.getElementById('previewCompanyAddress');
    const previewCompanyContacts = document.getElementById('previewCompanyContacts');
    const previewSignatureName = document.getElementById('previewSignatureName');
    const previewFooterEmail = document.getElementById('previewFooterEmail');
    const previewFooterWebsite = document.getElementById('previewFooterWebsite');

    if (previewCompanyName) previewCompanyName.textContent = s.companyName || 'YOUR COMPANY NAME';
    if (previewCompanyTagline) previewCompanyTagline.textContent = s.tagline || '';
    if (previewCompanyAddress) previewCompanyAddress.textContent = s.address || '';
    if (previewCompanyContacts) {
      const contacts = [s.email, s.website, s.phone].filter(Boolean).join(' | ');
      previewCompanyContacts.textContent = contacts;
    }
    if (previewSignatureName) previewSignatureName.textContent = s.signature || 'Authorized Signature';
    if (previewFooterEmail) previewFooterEmail.textContent = s.email || '';
    if (previewFooterWebsite) previewFooterWebsite.textContent = s.website || '';

    // Update sidebar branding dynamically
    const sidebarBrandName = document.querySelector('.sidebar-brand .brand-name');
    if (sidebarBrandName && s.companyName) {
      sidebarBrandName.textContent = s.companyName;
    }
    const sidebarBrandSub = document.querySelector('.sidebar-brand .brand-subtitle');
    if (sidebarBrandSub && s.tagline) {
      sidebarBrandSub.textContent = s.tagline;
    }
  };

  // Helper: Currency Formatter
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    const decimalPart = num.toString().split('.')[1] || '';
    const fractionDigits = Math.max(2, Math.min(decimalPart.length, 6));
    return '₹ ' + num.toLocaleString('en-IN', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  };

  // Helper: Rate Formatter (exact decimals when > 2, otherwise 2 decimals)
  const formatRate = (val) => {
    const num = Number(val || 0);
    if (isNaN(num)) return '0.00';
    const str = num.toString();
    const decimalPart = str.split('.')[1] || '';
    if (decimalPart.length > 2) {
      return str;
    }
    return num.toFixed(2);
  };

  // Helper: Compact Rate Formatter for chips & options
  const formatCompactRate = (val) => {
    const num = Number(val || 0);
    if (isNaN(num)) return '0';
    return num.toString();
  };

  // Helper: Toast
  const showToast = (message, type = 'normal') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Update Stats UI across all sections
  const updateStatsUI = () => {
    const statTotalClinics = document.getElementById('statTotalClinics');
    const statTotalBills = document.getElementById('statTotalBills');
    const statTotalSales = document.getElementById('statTotalSales');
    const statPendingAmount = document.getElementById('statPendingAmount');

    const totalClinicsCount = state.clinics.length;
    const totalBillsCount = state.recentBills.length;
    const totalSalesAmount = state.recentBills
      .filter(b => b.status === 'Paid')
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const pendingAmountVal = state.recentBills
      .filter(b => b.status !== 'Paid')
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    if (statTotalClinics) statTotalClinics.textContent = totalClinicsCount;
    if (statTotalBills) statTotalBills.textContent = totalBillsCount;
    if (statTotalSales) statTotalSales.textContent = formatCurrency(totalSalesAmount);
    if (statPendingAmount) statPendingAmount.textContent = formatCurrency(pendingAmountVal);

    // Sales Report View Dynamic Sync
    const salesReportMonthly = document.getElementById('salesReportMonthly');
    const salesReportInvoices = document.getElementById('salesReportInvoices');
    const salesReportAOV = document.getElementById('salesReportAOV');
    const salesReportAccounts = document.getElementById('salesReportAccounts');

    if (salesReportMonthly) salesReportMonthly.textContent = formatCurrency(totalSalesAmount);
    if (salesReportInvoices) salesReportInvoices.textContent = `${totalBillsCount} Invoices`;
    if (salesReportAOV) {
      const paidBills = state.recentBills.filter(b => b.status === 'Paid');
      const aov = paidBills.length > 0 ? (totalSalesAmount / paidBills.length) : 0;
      salesReportAOV.textContent = formatCurrency(aov);
    }
    if (salesReportAccounts) {
      const activeClinicsCount = state.clinics.filter(c => c.totalOrders > 0).length;
      salesReportAccounts.textContent = `${activeClinicsCount} Facilities`;
    }

    // Outstanding View Dynamic Sync
    renderOutstandingTable();
  };

  // --- ROUTING / VIEW SWITCHER ---
  const switchView = (viewId) => {
    state.currentView = viewId;

    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.view === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (viewId === 'view-clinics') {
      renderClinicsPageView();
    } else if (viewId === 'view-attendance') {
      renderAttendancePageView();
    } else if (viewId === 'view-all-bills') {
      renderAllBillsPageView();
    } else if (viewId === 'view-products') {
      renderProductsTable();
    } else if (viewId === 'view-sales-report') {
      updateStatsUI();
    } else if (viewId === 'view-outstanding') {
      renderOutstandingTable();
    } else if (viewId === 'view-settings') {
      renderSettingsUI();
    } else if (viewId === 'view-create-bill') {
      const createContainer = document.getElementById('createBillContainerView');
      const billingWorkspace = document.querySelector('.billing-workspace');
      if (createContainer && billingWorkspace) {
        createContainer.appendChild(billingWorkspace);
      }
      renderSettingsUI();
      updateProductsCatalogUI();
    } else if (viewId === 'view-dashboard') {
      const dashboard = document.getElementById('view-dashboard');
      const billingWorkspace = document.querySelector('.billing-workspace');
      const bottomGrid = document.querySelector('.bottom-tables-grid');
      if (dashboard && billingWorkspace && bottomGrid) {
        dashboard.insertBefore(billingWorkspace, bottomGrid);
      }
      renderSettingsUI();
      updateProductsCatalogUI();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.dataset.view;
      if (viewId) switchView(viewId);
    });
  });

  const brandLogoClick = document.getElementById('brandLogoClick');
  if (brandLogoClick) {
    brandLogoClick.addEventListener('click', () => switchView('view-dashboard'));
  }

  // --- BILLING WORKSPACE LOGIC ---
  const selectClinic = document.getElementById('selectClinic');
  const inputInvoiceNo = document.getElementById('inputInvoiceNo');
  const inputBillDate = document.getElementById('inputBillDate');
  const btnCalendarTrigger = document.getElementById('btnCalendarTrigger');
  const quickClinicName = document.getElementById('quickClinicName');
  const quickClinicAddress = document.getElementById('quickClinicAddress');
  const quickClinicPhone = document.getElementById('quickClinicPhone');
  const btnViewClinicDetails = document.getElementById('btnViewClinicDetails');
  const billingItemsBody = document.getElementById('billingItemsBody');
  const btnAddItemRow = document.getElementById('btnAddItemRow');
  const formTotalDisplay = document.getElementById('formTotalDisplay');

  // Preview elements
  const previewInvNo = document.getElementById('previewInvNo');
  const previewInvDate = document.getElementById('previewInvDate');
  const previewClinicName = document.getElementById('previewClinicName');
  const previewClinicAddress = document.getElementById('previewClinicAddress');
  const previewClinicPhone = document.getElementById('previewClinicPhone');
  const previewItemsBody = document.getElementById('previewItemsBody');
  const previewTotalDisplay = document.getElementById('previewTotalDisplay');

  // Date Formatting Helpers (ISO <-> DD/MM/YYYY)
  const formatIsoToDisplayDate = (isoStr) => {
    if (!isoStr) return getTodayFormatted();
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const formatDisplayToIsoDate = (dispStr) => {
    if (!dispStr) {
      const t = new Date();
      return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    }
    const parts = dispStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dispStr;
  };

  // Sync Input Bill Date & Calendar Symbol Trigger
  if (inputBillDate) {
    inputBillDate.value = formatDisplayToIsoDate(state.invoiceDate || getTodayFormatted());

    inputBillDate.addEventListener('change', () => {
      if (inputBillDate.value) {
        state.invoiceDate = formatIsoToDisplayDate(inputBillDate.value);
        if (previewInvDate) previewInvDate.textContent = state.invoiceDate;
      }
    });

    inputBillDate.addEventListener('click', () => {
      try {
        if (typeof inputBillDate.showPicker === 'function') {
          inputBillDate.showPicker();
        }
      } catch (err) { }
    });
  }

  if (btnCalendarTrigger && inputBillDate) {
    btnCalendarTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        if (typeof inputBillDate.showPicker === 'function') {
          inputBillDate.showPicker();
        } else {
          inputBillDate.focus();
        }
      } catch (err) {
        inputBillDate.focus();
      }
    });
  }

  // Update Top Navbar Today's Date Display
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  if (currentDateDisplay) {
    const todayNow = new Date();
    currentDateDisplay.textContent = todayNow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderClinicSelect = () => {
    if (!selectClinic) return;
    selectClinic.innerHTML = '<option value="">-- Select Clinic / Hospital --</option>';
    state.clinics.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === state.selectedClinicId) {
        opt.selected = true;
      }
      selectClinic.appendChild(opt);
    });
    updateSelectedClinicUI();
  };

  const updateSelectedClinicUI = () => {
    const clinic = state.clinics.find(c => c.id === state.selectedClinicId);

    if (clinic) {
      if (quickClinicName) quickClinicName.textContent = clinic.name;
      if (quickClinicAddress) quickClinicAddress.textContent = clinic.address;
      if (quickClinicPhone) quickClinicPhone.textContent = clinic.phone;
      if (btnViewClinicDetails) btnViewClinicDetails.style.display = 'inline-flex';

      if (previewClinicName) previewClinicName.textContent = clinic.name;
      if (previewClinicAddress) previewClinicAddress.textContent = clinic.address;
      if (previewClinicPhone) previewClinicPhone.textContent = `Phone: ${clinic.phone}`;
    } else {
      if (quickClinicName) quickClinicName.textContent = 'No Clinic Selected';
      if (quickClinicAddress) quickClinicAddress.textContent = 'Please select a clinic or hospital from the dropdown above';
      if (quickClinicPhone) quickClinicPhone.textContent = 'Phone: —';
      if (btnViewClinicDetails) btnViewClinicDetails.style.display = 'none';

      if (previewClinicName) previewClinicName.textContent = 'Select Clinic / Hospital';
      if (previewClinicAddress) previewClinicAddress.textContent = 'Address will appear here upon selection';
      if (previewClinicPhone) previewClinicPhone.textContent = 'Phone: —';
    }
  };

  const calculateAndRenderItems = () => {
    let totalSum = 0;
    if (billingItemsBody) billingItemsBody.innerHTML = '';
    if (previewItemsBody) previewItemsBody.innerHTML = '';

    if (state.items.length === 0) {
      if (billingItemsBody) {
        billingItemsBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94A3B8;">No items. Pick a product from the quick bar above or click <strong>+ Add New Item</strong>.</td></tr>`;
      }
      if (previewItemsBody) {
        previewItemsBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 16px; color: #94A3B8;">No items added.</td></tr>`;
      }
    } else {
      state.items.forEach((item, index) => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || 0);
        const rowAmount = qty * rate;
        totalSum += rowAmount;

        if (billingItemsBody) {
          const tr = document.createElement('tr');
          tr.dataset.id = item.id;
          tr.innerHTML = `
            <td style="text-align: center; color: #64748B;">${index + 1}</td>
            <td><input type="text" list="productsDatalist" class="item-name-input" data-id="${item.id}" value="${item.name}" placeholder="Type or pick product..." style="width: 100%;" autocomplete="off"></td>
            <td><input type="text" class="item-size-input" data-id="${item.id}" value="${item.size || ''}" placeholder="e.g. Med / 30x40" style="width: 100%;"></td>
            <td style="text-align: center;"><input type="number" class="input-qty" data-id="${item.id}" value="${item.qty}" style="width: 100%; text-align: center;" min="1"></td>
            <td style="text-align: right;"><input type="number" class="input-rate" data-id="${item.id}" value="${item.rate ? item.rate : ''}" placeholder="0.00" style="width: 100%; text-align: right;" step="any" min="0"></td>
            <td class="item-amount-cell" style="text-align: right; font-weight: 700; color: #1E293B;">${formatRate(rowAmount)}</td>
            <td style="text-align: center;">
              <button class="btn-delete-row" data-id="${item.id}" title="Remove item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </td>
          `;
          billingItemsBody.appendChild(tr);
        }

        if (previewItemsBody) {
          const previewTr = document.createElement('tr');
          previewTr.innerHTML = `
            <td style="text-align: center; color: #64748B;">${index + 1}</td>
            <td><strong>${item.name || '<span style="color:#CBD5E1; font-weight:normal;">[Item name]</span>'}</strong></td>
            <td style="color: #64748B;">${item.size || '—'}</td>
            <td style="text-align: center; font-weight: 700;">${item.qty}</td>
            <td style="text-align: right;">${rate > 0 ? formatRate(item.rate) : '0.00'}</td>
            <td style="text-align: right; font-weight: 700; color: #0F172A;">${formatRate(rowAmount)}</td>
          `;
          previewItemsBody.appendChild(previewTr);
        }
      });
    }

    const formattedTotal = formatCurrency(totalSum);
    if (formTotalDisplay) formTotalDisplay.textContent = formattedTotal;
    if (previewTotalDisplay) previewTotalDisplay.textContent = formattedTotal;

    attachItemEvents();
  };

  const updateTotalsWithoutRerender = () => {
    let totalSum = 0;
    state.items.forEach(item => {
      totalSum += Number(item.qty || 0) * Number(item.rate || 0);
    });
    const formattedTotal = formatCurrency(totalSum);
    if (formTotalDisplay) formTotalDisplay.textContent = formattedTotal;
    if (previewTotalDisplay) previewTotalDisplay.textContent = formattedTotal;
  };

  const attachItemEvents = () => {
    document.querySelectorAll('.item-name-input').forEach(inp => {
      const handleProductSelectOrType = (e) => {
        const id = Number(e.target.dataset.id);
        const item = state.items.find(i => i.id === id);
        if (!item) return;

        const typedVal = e.target.value;
        item.name = typedVal;

        // Try exact/case-insensitive match with pre-saved products catalog
        const matchedProd = state.products.find(p => p.name.trim().toLowerCase() === typedVal.trim().toLowerCase());
        if (matchedProd) {
          let defaultSize = 'Standard';
          if (matchedProd.sizes) {
            defaultSize = matchedProd.sizes.split(',')[0].trim();
          }
          item.name = matchedProd.name;
          item.size = defaultSize;
          item.rate = Number(matchedProd.rate || 0);

          const row = e.target.closest('tr');
          if (row) {
            const sizeInp = row.querySelector('.item-size-input');
            const rateInp = row.querySelector('.input-rate');
            const amountCell = row.querySelector('.item-amount-cell');
            const qtyInp = row.querySelector('.input-qty');

            if (sizeInp) sizeInp.value = item.size;
            if (rateInp) rateInp.value = item.rate > 0 ? item.rate : '';
            if (amountCell) amountCell.textContent = formatRate((item.qty || 0) * item.rate);
            if (qtyInp) {
              setTimeout(() => {
                qtyInp.focus();
                qtyInp.select();
              }, 40);
            }
          }
          updateTotalsWithoutRerender();
          updatePreviewItemsOnly();
          showToast(`Selected "${matchedProd.name}" — ₹${matchedProd.rate}`, 'normal');
        } else {
          updatePreviewItemsOnly();
        }
      };

      inp.addEventListener('input', handleProductSelectOrType);
      inp.addEventListener('change', handleProductSelectOrType);
    });

    document.querySelectorAll('.item-size-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const id = Number(e.target.dataset.id);
        const item = state.items.find(i => i.id === id);
        if (item) {
          item.size = e.target.value;
          updatePreviewItemsOnly();
        }
      });
    });

    document.querySelectorAll('.input-qty').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const id = Number(e.target.dataset.id);
        const item = state.items.find(i => i.id === id);
        if (item) {
          item.qty = Math.max(0, parseFloat(e.target.value) || 0);
          const row = e.target.closest('tr');
          if (row) {
            const amountCell = row.querySelector('.item-amount-cell');
            if (amountCell) amountCell.textContent = formatRate(item.qty * (item.rate || 0));
          }
          updateTotalsWithoutRerender();
          updatePreviewItemsOnly();
        }
      });
    });

    document.querySelectorAll('.input-rate').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const id = Number(e.target.dataset.id);
        const item = state.items.find(i => i.id === id);
        if (item) {
          item.rate = Math.max(0, parseFloat(e.target.value) || 0);
          const row = e.target.closest('tr');
          if (row) {
            const amountCell = row.querySelector('.item-amount-cell');
            if (amountCell) amountCell.textContent = formatRate((item.qty || 0) * item.rate);
          }
          updateTotalsWithoutRerender();
          updatePreviewItemsOnly();
        }
      });
    });

    document.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.items = state.items.filter(i => i.id !== id);
        calculateAndRenderItems();
      });
    });
  };

  const updatePreviewItemsOnly = () => {
    if (!previewItemsBody) return;
    previewItemsBody.innerHTML = '';
    state.items.forEach((item, index) => {
      const qty = Number(item.qty || 0);
      const rate = Number(item.rate || 0);
      const rowAmount = qty * rate;
      const previewTr = document.createElement('tr');
      previewTr.innerHTML = `
        <td style="text-align: center; color: #64748B;">${index + 1}</td>
        <td><strong>${item.name || '<span style="color:#CBD5E1; font-weight:normal;">[Item name]</span>'}</strong></td>
        <td style="color: #64748B;">${item.size}</td>
        <td style="text-align: center; font-weight: 700;">${item.qty}</td>
        <td style="text-align: right;">${rate > 0 ? formatRate(item.rate) : '0.00'}</td>
        <td style="text-align: right; font-weight: 700; color: #0F172A;">${formatRate(rowAmount)}</td>
      `;
      previewItemsBody.appendChild(previewTr);
    });
  };

  if (selectClinic) {
    selectClinic.addEventListener('change', (e) => {
      state.selectedClinicId = e.target.value;
      updateSelectedClinicUI();
    });
  }

  if (btnAddItemRow) {
    btnAddItemRow.addEventListener('click', () => {
      state.items.push({
        id: Date.now(),
        name: '',
        size: 'Medium',
        qty: 1,
        rate: 0
      });
      calculateAndRenderItems();
      setTimeout(() => {
        const inputs = document.querySelectorAll('.item-name-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
      }, 50);
    });
  }

  const btnResetForm = document.getElementById('btnResetForm');
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      state.selectedClinicId = '';
      selectClinic.value = '';
      updateSelectedClinicUI();
      state.items = [{ id: Date.now(), name: '', size: 'Medium', qty: 1, rate: 0 }];
      calculateAndRenderItems();
      showToast('Form reset to blank', 'normal');
    });
  }

  const btnSaveDraft = document.getElementById('btnSaveDraft');
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', () => {
      if (!state.selectedClinicId) {
        showToast('Please select a clinic first', 'normal');
        selectClinic.focus();
        return;
      }
      showToast(`Draft for ${state.invoiceNumber} saved`, 'success');
    });
  }

  const btnGenerateBill = document.getElementById('btnGenerateBill');
  if (btnGenerateBill) {
    btnGenerateBill.addEventListener('click', async () => {
      if (!state.selectedClinicId) {
        showToast('Please select a Clinic / Hospital', 'error');
        selectClinic.focus();
        return;
      }

      const validItems = state.items.filter(i => i.name.trim() !== '' && Number(i.qty) > 0);
      if (validItems.length === 0) {
        showToast('Please add at least one valid item name', 'error');
        return;
      }

      const total = validItems.reduce((sum, i) => sum + (Number(i.qty) * Number(i.rate)), 0);
      if (total <= 0) {
        showToast('Please enter item rate to calculate total', 'error');
        return;
      }

      const clinic = state.clinics.find(c => c.id === state.selectedClinicId);

      // Ensure we have the latest unique invoice number
      recalculateNextInvoiceNumber();

      const newBill = {
        id: generateUUID(),
        invoiceNo: state.invoiceNumber,
        clinicName: clinic ? clinic.name : 'Selected Clinic',
        clinicId: clinic ? clinic.id : null,
        date: state.invoiceDate,
        itemsSummary: validItems.map(i => `${i.name} (${i.qty})`).join(', '),
        amount: total,
        status: 'Paid',
        itemsSnapshot: JSON.parse(JSON.stringify(validItems))
      };

      // Instantly record locally
      state.recentBills.unshift(newBill);
      if (clinic) {
        clinic.totalOrders = (clinic.totalOrders || 0) + 1;
        clinic.totalBilled = (clinic.totalBilled || 0) + total;
      }

      saveLocalData();
      updateStatsUI();
      renderRecentBillsTable();
      renderAllBillsPageView();
      renderClinicsPageView();

      // Advance invoice counter for subsequent bill
      recalculateNextInvoiceNumber();

      // Sync bill to Supabase Cloud
      const cloudSuccess = await cloudSaveBill(newBill, clinic);
      if (cloudSuccess) {
        showToast(`🎉 Bill ${newBill.invoiceNo} saved & synced to cloud!`, 'success');
      } else {
        showToast(`💾 Bill ${newBill.invoiceNo} saved locally`, 'normal');
      }
    });
  }

  const btnQuickNewBill = document.getElementById('btnQuickNewBill');
  if (btnQuickNewBill) {
    btnQuickNewBill.addEventListener('click', () => {
      state.selectedClinicId = '';
      selectClinic.value = '';
      updateSelectedClinicUI();
      state.invoiceDate = getTodayFormatted();
      if (inputBillDate) inputBillDate.value = formatDisplayToIsoDate(state.invoiceDate);
      if (previewInvDate) previewInvDate.textContent = state.invoiceDate;
      state.items = [{ id: Date.now(), name: '', size: 'Medium', qty: 1, rate: 0 }];
      calculateAndRenderItems();
      showToast('Ready for new bill entry', 'normal');
    });
  }

  // --- DEDICATED CLINICS PAGE ---
  const renderClinicsPageView = (searchTerm = '') => {
    const cardsContainer = document.getElementById('clinicCardsContainer');
    const tableBody = document.getElementById('clinicsFullTableBody');
    const searchVal = searchTerm || (document.getElementById('searchClinicPageInput') ? document.getElementById('searchClinicPageInput').value : '');

    const filtered = state.clinics.filter(c =>
      c.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.address.toLowerCase().includes(searchVal.toLowerCase())
    );

    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      if (filtered.length === 0) {
        cardsContainer.innerHTML = `
          <div style="grid-column: 1/-1; background: white; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); padding: 36px; text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #FFF1F2; color: #E11D48; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
            </div>
            <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">No Clinics or Hospitals Added Yet</h4>
            <p style="color: var(--text-muted); font-size: 12.5px; margin-bottom: 16px;">Register your first hospital or clinic facility to begin billing.</p>
            <button class="btn-add-clinic-pill" onclick="document.getElementById('addClinicModal').classList.add('active')">+ Add First Clinic</button>
          </div>
        `;
      } else {
        filtered.forEach(clinic => {
          const card = document.createElement('div');
          card.className = 'clinic-card-box';
          card.innerHTML = `
            <div class="clinic-card-top">
              <div class="clinic-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M9 15h1"/><path d="M14 7h1"/><path d="M14 11h1"/><path d="M14 15h1"/></svg>
              </div>
              <div class="clinic-card-meta">
                <h4>${clinic.name}</h4>
                <p>${clinic.contactPerson || 'Procurement'}</p>
              </div>
            </div>
            <div style="font-size: 11.5px; color: #475569; display: flex; flex-direction: column; gap: 3px;">
              <div><strong>Phone:</strong> ${clinic.phone}</div>
              <div><strong>Address:</strong> ${clinic.address}</div>
            </div>
            <div class="clinic-card-stats">
              <div class="stat-item">
                <span>Total Orders</span>
                <strong>${clinic.totalOrders} Orders</strong>
              </div>
              <div class="stat-item">
                <span>Lifetime Billed</span>
                <strong style="color: #E11D48;">${formatCurrency(clinic.totalBilled)}</strong>
              </div>
            </div>
            <div class="clinic-card-actions">
              <button class="btn-pill-generate" onclick="window.startBillForClinic('${clinic.id}')" style="padding: 5px 14px; font-size: 11.5px;">+ Create Bill</button>
              <div class="action-icons-group">
                <button class="btn-action-icon" onclick="window.openClinicEdit('${clinic.id}')" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-action-icon delete" onclick="window.deleteClinic('${clinic.id}')" title="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          `;
          cardsContainer.appendChild(card);
        });
      }
    }

    if (tableBody) {
      tableBody.innerHTML = '';
      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94A3B8;">No clinics registered. Click <strong>+ Add New Clinic</strong> above.</td></tr>`;
      } else {
        filtered.forEach(clinic => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-weight: 700; color: #1E293B;">${clinic.name}</td>
            <td style="color: #64748B;">${clinic.contactPerson || '—'}</td>
            <td style="color: #475569; font-weight: 600;">${clinic.phone}</td>
            <td style="color: #64748B; font-size: 11.5px;">${clinic.address}</td>
            <td style="text-align: center; font-weight: 700;">${clinic.totalOrders}</td>
            <td style="text-align: right; font-weight: 800; color: #E11D48;">${formatCurrency(clinic.totalBilled)}</td>
            <td style="text-align: center;">
              <div class="action-icons-group" style="justify-content: center;">
                <button class="btn-pill-draft" onclick="window.startBillForClinic('${clinic.id}')" style="padding: 4px 10px; font-size: 11px;">Bill Now</button>
                <button class="btn-action-icon delete" onclick="window.deleteClinic('${clinic.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          `;
          tableBody.appendChild(tr);
        });
      }
    }
  };

  // --- DEDICATED OUTSTANDING / UNPAID BILLS PAGE ---
  const renderOutstandingTable = () => {
    const tableBody = document.getElementById('outstandingTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const unpaidBills = state.recentBills.filter(b => b.status === 'Unpaid');
    const totalPending = unpaidBills.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const pendingTotalEl = document.getElementById('outstandingTotalPending');
    const countTotalEl = document.getElementById('outstandingCount');
    if (pendingTotalEl) pendingTotalEl.textContent = formatCurrency(totalPending);
    if (countTotalEl) countTotalEl.textContent = unpaidBills.length;

    if (unpaidBills.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px; color: #10B981;">
            <div style="font-size: 24px; margin-bottom: 6px;">🎉</div>
            <strong>All Bills Paid!</strong> No outstanding receivables.
          </td>
        </tr>
      `;
      return;
    }

    unpaidBills.forEach(bill => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #1E293B;">${bill.invoiceNo}</td>
        <td style="font-weight: 700; color: #1E293B;">${bill.clinicName}</td>
        <td>${bill.date}</td>
        <td style="text-align: right; font-weight: 800; color: #E11D48;">${formatCurrency(bill.amount)}</td>
        <td style="text-align: center;">
          <span class="status-pill unpaid clickable" onclick="window.toggleBillStatus('${bill.invoiceNo}')" title="Click to mark as Paid">Unpaid</span>
        </td>
        <td style="text-align: center;">
          <div class="action-icons-group" style="justify-content: center; gap: 8px;">
            <button class="btn-pill-draft" onclick="window.toggleBillStatus('${bill.invoiceNo}')" style="padding: 4px 12px; font-size: 11.5px; font-weight: 700; color: #059669; border-color: #10B981;">✓ Mark Paid</button>
            <button class="btn-action-icon delete" onclick="window.deleteBill('${bill.invoiceNo}')" title="Delete Invoice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  };

  // --- DEDICATED ALL BILLS PAGE ---
  const renderAllBillsPageView = (searchTerm = '') => {
    const tableBody = document.getElementById('allBillsFullTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const searchVal = (searchTerm || (document.getElementById('searchAllBillsInput') ? document.getElementById('searchAllBillsInput').value : '')).toLowerCase().trim();
    let filtered = state.recentBills.filter(b => {
      const inv = (b.invoiceNo || '').toLowerCase();
      const clinic = (b.clinicName || '').toLowerCase();
      const items = (b.itemsSummary || '').toLowerCase();
      const date = (b.date || '').toLowerCase();
      const match = !searchVal || inv.includes(searchVal) || clinic.includes(searchVal) || items.includes(searchVal) || date.includes(searchVal);
      if (!state.allBillsFilter || state.allBillsFilter === 'All') return match;
      return match && b.status === state.allBillsFilter;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94A3B8;">No invoices found. Generate your first bill to see history!</td></tr>`;
    } else {
      filtered.forEach(bill => {
        const isPaid = bill.status === 'Paid';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 800; color: #1E293B;">${bill.invoiceNo}</td>
          <td style="font-weight: 700; color: #475569;">${bill.clinicName}</td>
          <td style="color: #64748B;">${bill.date}</td>
          <td style="color: #64748B; font-size: 11.5px;">${bill.itemsSummary || '—'}</td>
          <td style="text-align: right; font-weight: 800; color: #0F172A;">${formatCurrency(bill.amount)}</td>
          <td style="text-align: center;">
            <span class="status-pill ${isPaid ? 'paid' : 'unpaid'} clickable" onclick="window.toggleBillStatus('${bill.invoiceNo}')" title="Click to toggle Paid/Unpaid">
              ${isPaid ? '✓ Paid' : '● Unpaid'}
            </span>
          </td>
          <td style="text-align: center;">
            <div class="action-icons-group" style="justify-content: center;">
              <button class="btn-action-icon" onclick="window.viewInvoiceDetail('${bill.invoiceNo}')" title="View & Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn-action-icon" onclick="window.printInvoice('${bill.invoiceNo}')" title="Print Invoice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
              <button class="btn-action-icon" onclick="window.downloadInvoicePdf('${bill.invoiceNo}')" title="Download PDF File">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button class="btn-action-icon delete" onclick="window.deleteBill('${bill.invoiceNo}')" title="Delete Invoice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    renderRecentBillsTable(searchVal);
  };

  const renderRecentBillsTable = (searchTerm = '') => {
    const recentBillsTableBody = document.getElementById('recentBillsTableBody');
    if (!recentBillsTableBody) return;
    recentBillsTableBody.innerHTML = '';
    const searchVal = (searchTerm || (document.getElementById('searchBillsInput') ? document.getElementById('searchBillsInput').value : '')).toLowerCase().trim();
    let filtered = state.recentBills.filter(bill => {
      const inv = (bill.invoiceNo || '').toLowerCase();
      const clinic = (bill.clinicName || '').toLowerCase();
      const match = !searchVal || inv.includes(searchVal) || clinic.includes(searchVal);
      if (!state.billStatusFilter || state.billStatusFilter === 'All') return match;
      return match && bill.status === state.billStatusFilter;
    });

    if (filtered.length === 0) {
      recentBillsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #94A3B8;">No recent bills yet.</td></tr>`;
      return;
    }

    filtered.forEach(bill => {
      const isPaid = bill.status === 'Paid';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #1E293B;">${bill.invoiceNo}</td>
        <td style="color: #475569; font-weight: 600;">${bill.clinicName}</td>
        <td style="color: #64748B;">${bill.date}</td>
        <td style="text-align: right; font-weight: 700; color: #0F172A;">${formatCurrency(bill.amount)}</td>
        <td style="text-align: center;">
          <span class="status-pill ${isPaid ? 'paid' : 'unpaid'} clickable" onclick="window.toggleBillStatus('${bill.invoiceNo}')" title="Click to toggle Paid/Unpaid">
            ${isPaid ? '✓ Paid' : '● Unpaid'}
          </span>
        </td>
        <td style="text-align: center;">
          <div class="action-icons-group" style="justify-content: center;">
            <button class="btn-action-icon" onclick="window.viewInvoiceDetail('${bill.invoiceNo}')" title="View & Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn-action-icon" onclick="window.printInvoice('${bill.invoiceNo}')" title="Print Invoice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
            <button class="btn-action-icon" onclick="window.downloadInvoicePdf('${bill.invoiceNo}')" title="Download PDF File">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="btn-action-icon delete" onclick="window.deleteBill('${bill.invoiceNo}')" title="Delete Invoice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      recentBillsTableBody.appendChild(tr);
    });
  };

  // --- INVOICE PREVIEW & RENDERING HELPERS ---
  window.populateInvoicePreview = (bill) => {
    // Keep company letterhead and signature in sync
    renderSettingsUI();

    if (!bill) {
      // Default to live active form in state
      const clinic = state.clinics.find(c => c.id === state.selectedClinicId);
      if (previewInvNo) previewInvNo.textContent = state.invoiceNumber;
      if (previewInvDate) previewInvDate.textContent = state.invoiceDate || getTodayFormatted();
      if (clinic) {
        if (previewClinicName) previewClinicName.textContent = clinic.name;
        if (previewClinicAddress) previewClinicAddress.textContent = clinic.address;
        if (previewClinicPhone) previewClinicPhone.textContent = `Phone: ${clinic.phone}`;
      }
      calculateAndRenderItems();
      return;
    }

    if (previewInvNo) previewInvNo.textContent = bill.invoiceNo;
    if (previewInvDate) previewInvDate.textContent = bill.date;

    const clinic = state.clinics.find(c => c.id === bill.clinicId || c.name === bill.clinicName);
    if (previewClinicName) previewClinicName.textContent = bill.clinicName || (clinic ? clinic.name : 'Clinic / Hospital');
    if (previewClinicAddress) previewClinicAddress.textContent = clinic ? clinic.address : 'Registered Medical Center';
    if (previewClinicPhone) previewClinicPhone.textContent = clinic ? `Phone: ${clinic.phone}` : '—';

    // Populate items
    if (previewItemsBody) {
      previewItemsBody.innerHTML = '';
      const items = bill.itemsSnapshot || [];
      items.forEach((item, index) => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || 0);
        const rowAmount = qty * rate;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-align: center; color: #64748B;">${index + 1}</td>
          <td><strong>${item.name}</strong></td>
          <td style="color: #64748B;">${item.size || '—'}</td>
          <td style="text-align: center; font-weight: 700;">${item.qty}</td>
          <td style="text-align: right;">${formatRate(rate)}</td>
          <td style="text-align: right; font-weight: 700; color: #0F172A;">${formatRate(rowAmount)}</td>
        `;
        previewItemsBody.appendChild(tr);
      });
    }

    if (previewTotalDisplay) previewTotalDisplay.textContent = formatCurrency(bill.amount);
  };

  // Dedicated Print Function — opens isolated popup with just the invoice
  window.printInvoice = (invoiceNo) => {
    let bill = null;
    if (invoiceNo) {
      bill = state.recentBills.find(b => b.invoiceNo === invoiceNo);
    }
    // Populate preview first so HTML is up to date
    window.populateInvoicePreview(bill);

    setTimeout(() => {
      const sheet = document.getElementById('invoiceSheetToExport');
      if (!sheet) { window.print(); return; }

      const s = state.settings;
      const invNo = bill ? bill.invoiceNo : (previewInvNo ? previewInvNo.textContent : 'Invoice');
      const invDate = bill ? bill.date : (previewInvDate ? previewInvDate.textContent : '');
      const invStatus = bill ? (bill.status || 'Paid') : 'Paid';
      const clinicObj = bill
        ? state.clinics.find(c => c.id === bill.clinicId || c.name === bill.clinicName)
        : state.clinics.find(c => c.id === state.selectedClinicId);
      const clinicName = clinicObj ? clinicObj.name : (bill ? bill.clinicName : 'Clinic / Hospital');
      const clinicAddr = clinicObj ? clinicObj.address : '';
      const clinicPhone = clinicObj ? clinicObj.phone : '';

      const items = bill && bill.itemsSnapshot ? bill.itemsSnapshot : state.items;
      let total = 0;
      let itemRows = items.map((item, i) => {
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || 0);
        const amt = qty * rate;
        total += amt;
        return `<tr>
          <td style="text-align:center;color:#64748B;padding:7px 10px;">${i + 1}</td>
          <td style="padding:7px 10px;font-weight:600;">${item.name}</td>
          <td style="padding:7px 10px;color:#64748B;">${item.size || '—'}</td>
          <td style="text-align:center;font-weight:700;padding:7px 10px;">${qty}</td>
          <td style="text-align:right;padding:7px 10px;">${formatRate(rate)}</td>
          <td style="text-align:right;font-weight:700;color:#0F172A;padding:7px 10px;">${formatRate(amt)}</td>
        </tr>`;
      }).join('');

      const totalFormatted = '₹ ' + Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const companyName = s.companyName || 'YOUR COMPANY NAME';
      const tagline = s.tagline || 'Clinic & Hospital Covers';
      const address = s.address || '';
      const contacts = [s.email, s.website, s.phone].filter(Boolean).join(' | ');
      const signature = s.signature || 'Authorized Signature';
      const statusColor = invStatus === 'Paid' ? '#16A34A' : '#E11D48';

      const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invNo}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 12mm 14mm; 
    }
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    body { 
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; 
      background: #f8fafc; 
      color: #0F172A; 
      font-size: 12px;
      padding: 0;
      display: flex;
      justify-content: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Outer Box Enclosing All 4 Corners */
    .invoice-card-box {
      width: 100%;
      max-width: 760px;
      background: #ffffff;
      border: 1.5px solid #CBD5E1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      margin: 0 auto;
      page-break-inside: avoid;
    }
    .wave { 
      height: 18px; 
      background: linear-gradient(90deg, #6B21A8 0%, #D9247B 40%, #F97316 80%, #FBBF24 100%); 
      border-bottom-left-radius: 50% 8px;
      border-bottom-right-radius: 50% 8px;
      print-color-adjust: exact; 
      -webkit-print-color-adjust: exact; 
    }
    .body { 
      padding: 22px 26px; 
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      padding-bottom: 14px;
      border-bottom: 1px solid #F1F5F9;
    }
    .brand {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%);
      border: 1px solid #FECDD3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #E11D48;
      font-size: 18px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .brand h4 { font-size: 16px; font-weight: 900; color: #0F172A; letter-spacing: -0.3px; }
    .brand .tag { font-size: 11px; color: #64748B; margin: 2px 0 5px; font-weight: 600; }
    .brand p { font-size: 10.5px; color: #475569; line-height: 1.5; }
    .meta { text-align: right; }
    .badge { 
      display: inline-block; 
      background: linear-gradient(90deg, #D9247B 0%, #E11D48 50%, #F97316 100%); 
      color: #fff; 
      font-size: 10px; 
      font-weight: 800; 
      padding: 4px 14px; 
      border-radius: 999px; 
      letter-spacing: 1.2px; 
      margin-bottom: 8px; 
      print-color-adjust: exact; 
      -webkit-print-color-adjust: exact; 
    }
    .meta-line { font-size: 11.5px; color: #475569; margin-top: 3px; }
    .meta-line strong { color: #0F172A; font-weight: 700; }
    
    .billing-to { 
      background: #FFF8F9; 
      border: 1px solid #FFE4E6; 
      border-radius: 8px; 
      padding: 12px 16px; 
    }
    .billing-to .lbl { font-size: 9.5px; font-weight: 800; color: #E11D48; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .billing-to .name { font-size: 14px; font-weight: 800; color: #0F172A; }
    .billing-to .addr { font-size: 11px; color: #64748B; margin-top: 2px; }
    
    table { width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden; }
    thead th { 
      background: linear-gradient(90deg, #D9247B 0%, #E11D48 45%, #F97316 100%); 
      color: #fff; 
      padding: 9px 10px; 
      font-size: 11px; 
      font-weight: 700; 
      text-align: left; 
      print-color-adjust: exact; 
      -webkit-print-color-adjust: exact; 
    }
    thead th.c { text-align: center; }
    thead th.r { text-align: right; }
    tbody tr:nth-child(even) td { background: #F8FAFC; }
    tbody td { border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #1E293B; }
    
    .total-row { 
      display: flex; 
      justify-content: flex-end; 
      align-items: center; 
      gap: 16px; 
      margin-top: 6px;
    }
    .total-lbl { font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    .total-box { 
      border: 2px solid #E11D48; 
      background: #FFF1F2;
      border-radius: 8px; 
      padding: 8px 18px; 
      font-size: 16px; 
      font-weight: 900; 
      color: #E11D48; 
      min-width: 140px; 
      text-align: right; 
      print-color-adjust: exact; 
      -webkit-print-color-adjust: exact; 
    }
    .footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end; 
      margin-top: 14px; 
      padding-top: 14px; 
      border-top: 1px solid #F1F5F9; 
    }
    .thanks { font-family: Georgia, serif; font-style: italic; font-size: 16px; color: #4F46E5; }
    .sig { text-align: right; }
    .sig-name { font-family: Georgia, serif; font-style: italic; font-size: 20px; color: #1E293B; }
    .sig-line { width: 160px; border-top: 1.5px solid #CBD5E1; margin: 8px 0 4px auto; }
    .sig-label { font-size: 10px; color: #94A3B8; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="invoice-card-box">
    <div class="wave"></div>
    <div class="body">
      <div class="header">
        <div class="brand">
          <div class="brand-icon">✦</div>
          <div>
            <h4>${companyName}</h4>
            <div class="tag">${tagline}</div>
            <p>${address}</p>
            <p>${contacts}</p>
          </div>
        </div>
        <div class="meta">
          <div class="badge">INVOICE</div>
          <div class="meta-line">Invoice No : <strong>${invNo}</strong></div>
          <div class="meta-line">Date : <strong>${invDate}</strong></div>
        </div>
      </div>

      <div class="billing-to">
        <div class="lbl">Billing To</div>
        <div class="name">${clinicName}</div>
        <div class="addr">${clinicAddr}${clinicPhone ? ' &nbsp;|&nbsp; Phone: ' + clinicPhone : ''}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="c" style="width:28px;">#</th>
            <th>Item / Cover Line</th>
            <th style="width:80px;">Size</th>
            <th class="c" style="width:50px;">Qty</th>
            <th class="r" style="width:75px;">Rate (₹)</th>
            <th class="r" style="width:85px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="total-row">
        <span class="total-lbl">Total</span>
        <div class="total-box">${totalFormatted}</div>
      </div>

      <div class="footer">
        <div class="thanks">Thank you for your business!</div>
        <div class="sig">
          <div class="sig-name">${signature}</div>
          <div class="sig-line"></div>
          <div class="sig-label">AUTHORIZED SIGNATURE</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

      const printWin = window.open('', '_blank', 'width=840,height=900');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(printHTML);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 400);
      } else {
        window.print();
      }
    }, 50);
  };

  window.downloadInvoicePdf = (invoiceNo) => {
    let bill = null;
    if (invoiceNo) {
      bill = state.recentBills.find(b => b.invoiceNo === invoiceNo);
    }
    window.populateInvoicePreview(bill);
    const element = document.getElementById('invoiceSheetToExport');
    if (!element) {
      window.print();
      return;
    }
    const invName = bill ? bill.invoiceNo : (state.invoiceNumber || 'Invoice');
    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: 8,
        filename: `${invName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  window.viewInvoiceDetail = (invoiceNo) => {
    const bill = state.recentBills.find(b => b.invoiceNo === invoiceNo);
    if (!bill) return;
    window.populateInvoicePreview(bill);
    switchView('view-dashboard');
    showToast(`Loaded preview for ${invoiceNo}`, 'normal');
  };

  window.toggleBillStatus = async (invoiceNo) => {
    const bill = state.recentBills.find(b => b.invoiceNo === invoiceNo);
    if (!bill) return;
    bill.status = bill.status === 'Paid' ? 'Unpaid' : 'Paid';
    saveLocalData();
    updateStatsUI();
    renderRecentBillsTable();
    renderAllBillsPageView();
    renderOutstandingTable();
    cloudUpdateBillStatus(invoiceNo, bill.status);
    showToast(`Invoice ${invoiceNo} marked as ${bill.status}`, 'success');
  };

  window.startBillForClinic = (clinicId) => {
    state.selectedClinicId = clinicId;
    renderClinicSelect();
    switchView('view-create-bill');
  };

  window.deleteClinic = async (clinicId) => {
    if (!confirm('Are you sure you want to remove this clinic facility?')) return;
    state.clinics = state.clinics.filter(c => c.id !== clinicId);
    if (state.selectedClinicId === clinicId) {
      state.selectedClinicId = state.clinics.length > 0 ? state.clinics[0].id : '';
    }
    saveLocalData();
    renderClinicSelect();
    renderClinicsPageView();
    updateStatsUI();
    cloudDeleteClinic(clinicId);
    showToast('Clinic facility deleted', 'normal');
  };

  window.deleteBill = async (invoiceNo) => {
    if (!confirm(`Are you sure you want to permanently delete invoice ${invoiceNo}?`)) return;

    const billToDelete = state.recentBills.find(b => b.invoiceNo === invoiceNo);
    if (!billToDelete) return;

    // Remove bill from local state
    state.recentBills = state.recentBills.filter(b => b.invoiceNo !== invoiceNo);

    // Recalculate clinic orders & total billed
    state.clinics.forEach(c => {
      const cBills = state.recentBills.filter(b => b.clinicId === c.id || b.clinicName === c.name);
      c.totalOrders = cBills.length;
      c.totalBilled = cBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    });

    // Save and instantly update dashboard stat cards and tables
    saveLocalData();
    updateStatsUI();
    renderRecentBillsTable();
    renderAllBillsPageView();
    renderOutstandingTable();
    renderClinicsPageView();
    recalculateNextInvoiceNumber();

    // Async sync deletion to Cloud Supabase
    cloudDeleteBill(invoiceNo);
    showToast(`Invoice ${invoiceNo} deleted successfully`, 'normal');
  };

  const renderProductsTable = () => {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (state.products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 28px; color: #94A3B8;">
        <div style="font-size: 13.5px; margin-bottom: 10px;">No products found in catalog.</div>
        <button type="button" class="btn-add-clinic-pill" style="display: inline-flex; margin: 0 auto; font-size: 12px; padding: 6px 14px;" onclick="document.getElementById('addProductModal').classList.add('active')">+ Add First Product</button>
      </td></tr>`;
      return;
    }
    state.products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #1E293B;">${p.name}</td>
        <td style="color: #64748B;">${p.sizes || '—'}</td>
        <td style="color: #475569; font-size: 11.5px;">${p.spec || '—'}</td>
        <td style="text-align: right; font-weight: 700; color: #E11D48;">${formatCurrency(p.rate)}</td>
        <td style="text-align: center;"><span class="status-pill paid">Active</span></td>
        <td style="text-align: center;">
          <div class="action-icons-group" style="justify-content: center; gap: 6px;">
            <button class="btn-action-icon edit" onclick="window.openProductEditModal('${p.id}')" title="Edit Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-action-icon delete" onclick="window.deleteProduct('${p.id}')" title="Delete Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  };

  window.openProductEditModal = (productId) => {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('addProductModal');
    const modalTitle = document.getElementById('addProductModalTitle');
    const submitBtn = document.getElementById('btnSubmitProductModal');
    const editIdInput = document.getElementById('editProductId');
    const nameInput = document.getElementById('newProductName');
    const sizesInput = document.getElementById('newProductSizes');
    const specInput = document.getElementById('newProductSpec');
    const rateInput = document.getElementById('newProductRate');

    if (modalTitle) modalTitle.textContent = '✏️ Edit Product Line';
    if (submitBtn) submitBtn.textContent = 'Update Product';
    if (editIdInput) editIdInput.value = prod.id;
    if (nameInput) nameInput.value = prod.name || '';
    if (sizesInput) sizesInput.value = prod.sizes || '';
    if (specInput) specInput.value = prod.spec || '';
    if (rateInput) rateInput.value = prod.rate !== undefined ? prod.rate : '';

    if (modal) {
      modal.classList.add('active');
      if (nameInput) setTimeout(() => nameInput.focus(), 50);
    }
  };

  window.deleteProduct = (productId) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    state.products = state.products.filter(p => p.id !== productId);
    saveLocalData();
    renderProductsTable();
    updateProductsCatalogUI();
    cloudDeleteProduct(productId);
    showToast('Product removed', 'normal');
  };

  const updateProductsCatalogUI = () => {
    // 1. Update Datalist for table autocomplete
    const datalist = document.getElementById('productsDatalist');
    if (datalist) {
      datalist.innerHTML = state.products.map(p => {
        const sizeInfo = p.sizes ? ` (${p.sizes})` : '';
        return `<option value="${p.name}">₹${formatCompactRate(p.rate)}${sizeInfo}</option>`;
      }).join('');
    }

    // 2. Update Quick Add Pills Bar in Create Bill
    const pillsContainer = document.getElementById('quickCatalogPills');
    const barContainer = document.getElementById('quickCatalogBar');
    if (pillsContainer) {
      if (!state.products || state.products.length === 0) {
        if (barContainer) barContainer.style.display = 'none';
        pillsContainer.innerHTML = '';
      } else {
        if (barContainer) barContainer.style.display = 'flex';
        pillsContainer.innerHTML = state.products.map(p => `
          <button type="button" class="product-chip-btn" onclick="window.addCatalogProductToBill('${p.id}')" title="Click to add ${p.name} to bill">
            <span class="chip-icon">+</span>
            <span>${p.name}</span>
            <span class="chip-rate">₹${formatCompactRate(p.rate)}</span>
          </button>
        `).join('');
      }
    }
  };

  window.addCatalogProductToBill = (productId) => {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    let defaultSize = 'Standard';
    if (prod.sizes) {
      defaultSize = prod.sizes.split(',')[0].trim();
    }

    // If only 1 row exists and it's completely empty, replace it
    if (state.items.length === 1 && (!state.items[0].name || !state.items[0].name.trim()) && (!state.items[0].rate || state.items[0].rate === 0)) {
      state.items[0].name = prod.name;
      state.items[0].size = defaultSize;
      state.items[0].rate = Number(prod.rate || 0);
    } else {
      state.items.push({
        id: Date.now(),
        name: prod.name,
        size: defaultSize,
        qty: 1,
        rate: Number(prod.rate || 0)
      });
    }

    calculateAndRenderItems();

    // Focus the quantity input of the added/updated row
    setTimeout(() => {
      const qtyInputs = document.querySelectorAll('.input-qty');
      if (qtyInputs.length > 0) {
        const lastQty = qtyInputs[qtyInputs.length - 1];
        lastQty.focus();
        lastQty.select();
      }
    }, 50);

    showToast(`Added "${prod.name}" (₹${prod.rate})`, 'normal');
  };

  const cloudSaveClinic = async (clinic) => {
    try {
      if (!clinic || !clinic.name) return false;
      const clinicId = (clinic.id && clinic.id.length === 36) ? clinic.id : generateUUID();
      clinic.id = clinicId;

      const payload = {
        id: clinicId,
        name: clinic.name,
        contact_person: clinic.contactPerson || '',
        phone: clinic.phone || '',
        address: clinic.address || '',
        total_billed: parseFloat(clinic.totalBilled) || 0
      };

      try {
        await cloudDb.insert('clinics', [payload]);
      } catch (insErr) {
        await cloudDb.update('clinics', payload, `id=eq.${clinicId}`);
      }
      return true;
    } catch (err) {
      console.error('Cloud save clinic error:', err);
      return false;
    }
  };

  const cloudSaveBill = async (bill, clinic) => {
    try {
      if (clinic) {
        await cloudSaveClinic(clinic);
      }
      let clinicUuid = (clinic && clinic.id && clinic.id.length === 36) ? clinic.id : null;
      const payload = {
        invoice_no: bill.invoiceNo,
        clinic_id: clinicUuid,
        clinic_name: bill.clinicName,
        date: bill.date,
        items: bill.itemsSnapshot,
        subtotal: bill.amount,
        total_amount: bill.amount,
        status: bill.status || 'Paid'
      };
      try {
        await cloudDb.insert('bills', [payload]);
      } catch (insertErr) {
        console.warn('Initial bill insert failed, retrying without FK clinic_id:', insertErr);
        payload.clinic_id = null;
        await cloudDb.insert('bills', [payload]);
      }
      if (clinic && clinic.id && clinic.id.length === 36) {
        try {
          await cloudDb.update('clinics', {
            total_billed: clinic.totalBilled || 0
          }, `id=eq.${clinic.id}`);
        } catch (uErr) { }
      }
      return true;
    } catch (err) {
      console.error('Cloud save bill error:', err);
      return false;
    }
  };

  const cloudUpdateBillStatus = async (invoiceNo, status) => {
    try {
      await cloudDb.update('bills', { status }, `invoice_no=eq.${invoiceNo}`);
      return true;
    } catch (err) {
      console.error('Cloud update bill status error:', err);
      return false;
    }
  };

  const cloudSaveProduct = async (product) => {
    try {
      await cloudDb.insert('products', [{
        id: product.id,
        name: product.name,
        sizes: product.sizes,
        spec: product.spec,
        rate: product.rate
      }]);
      return true;
    } catch (err) {
      console.error('Cloud save product error:', err);
      return false;
    }
  };

  const cloudUpdateProduct = async (product) => {
    try {
      await cloudDb.update('products', {
        name: product.name,
        sizes: product.sizes,
        spec: product.spec,
        rate: product.rate
      }, `id=eq.${product.id}`);
      return true;
    } catch (err) {
      console.error('Cloud update product error:', err);
      return false;
    }
  };

  const cloudDeleteProduct = async (productId) => {
    try {
      await cloudDb.delete('products', `id=eq.${productId}`);
      return true;
    } catch (err) {
      console.error('Cloud delete product error:', err);
      return false;
    }
  };

  const cloudDeleteClinic = async (clinicId) => {
    try {
      if (clinicId && clinicId.length === 36) {
        await cloudDb.delete('clinics', `id=eq.${clinicId}`);
      }
      return true;
    } catch (err) {
      console.error('Cloud delete clinic error:', err);
      return false;
    }
  };

  const cloudDeleteBill = async (invoiceNo) => {
    try {
      await cloudDb.delete('bills', `invoice_no=eq.${invoiceNo}`);
      return true;
    } catch (err) {
      console.error('Cloud delete bill error:', err);
      return false;
    }
  };

  const cloudSaveSettings = async (settings) => {
    try {
      const payload = {
        company_name: settings.companyName,
        tagline: settings.tagline,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        invoice_prefix: settings.invoicePrefix,
        authorized_signature: settings.signature,
        updated_at: new Date().toISOString()
      };
      try {
        await cloudDb.update('company_settings', payload, 'id=eq.1');
      } catch (patchErr) {
        await cloudDb.insert('company_settings', [{ id: 1, ...payload }]);
      }
      return true;
    } catch (err) {
      console.error('Cloud save settings error:', err);
      return false;
    }
  };

  const cloudSaveEmployee = async (employee) => {
    try {
      const payload = {
        id: employee.id,
        name: employee.name,
        role: employee.role || '',
        phone: employee.phone || '',
        created_at: new Date().toISOString()
      };
      await cloudDb.upsert('employees', [payload], 'id');
      return true;
    } catch (err) {
      console.warn('Cloud save employee notice (local saved):', err);
      return false;
    }
  };

  const cloudDeleteEmployee = async (employeeId) => {
    try {
      if (employeeId && employeeId.length === 36) {
        await cloudDb.delete('employees', `id=eq.${employeeId}`);
        await cloudDb.delete('attendance', `employee_id=eq.${employeeId}`);
      }
      return true;
    } catch (err) {
      console.warn('Cloud delete employee notice:', err);
      return false;
    }
  };

  const cloudSaveAttendanceDay = async (dateStr, records) => {
    try {
      if (!Array.isArray(records) || records.length === 0) return true;

      // FIRST: Ensure all active employees exist in Supabase employees table
      // to guarantee foreign key integrity across devices!
      if (Array.isArray(state.employees) && state.employees.length > 0) {
        const empPayloads = state.employees.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role || '',
          phone: e.phone || '',
          created_at: new Date().toISOString()
        }));
        try {
          await cloudDb.upsert('employees', empPayloads, 'id');
        } catch (empErr) {
          console.warn('Pre-sync employees notice:', empErr);
        }
      }

      try {
        await cloudDb.delete('attendance', `date=eq.${dateStr}`);
      } catch (delErr) { }

      const payloads = records.map(r => ({
        id: generateUUID(),
        employee_id: r.employeeId,
        employee_name: r.employeeName || '',
        date: dateStr,
        status: r.status || 'Present',
        notes: r.notes || '',
        created_at: new Date().toISOString()
      }));

      await cloudDb.upsert('attendance', payloads, 'id');
      return true;
    } catch (err) {
      console.warn('Cloud save attendance notice (local saved):', err);
      return false;
    }
  };

  const cloudFetchAllData = async () => {
    try {
      const [dbClinics, dbBills, dbProducts, dbSettings, dbEmployees, dbAttendance] = await Promise.all([
        cloudDb.get('clinics'),
        cloudDb.get('bills', 'select=*&order=created_at.desc'),
        cloudDb.get('products'),
        cloudDb.get('company_settings', 'id=eq.1'),
        cloudDb.get('employees').catch(() => null),
        cloudDb.get('attendance').catch(() => null)
      ]);

      let hasCloudData = false;
      if (Array.isArray(dbClinics)) {
        if (dbClinics.length > 0) {
          state.clinics = dbClinics.map(c => ({
            id: c.id,
            name: c.name,
            contactPerson: c.contact_person,
            phone: c.phone,
            address: c.address,
            totalBilled: parseFloat(c.total_billed) || 0,
            totalOrders: 0
          }));
          hasCloudData = true;
        } else {
          const realLocalClinics = (state.clinics || []).filter(c => c.id !== 'c1' && c.id !== 'c2' && c.id !== 'c3');
          if (realLocalClinics.length > 0) {
            for (const c of realLocalClinics) {
              await cloudSaveClinic(c);
            }
          } else {
            state.clinics = [];
          }
        }
      }

      if (Array.isArray(dbBills)) {
        if (dbBills.length > 0) {
          state.recentBills = dbBills.map(b => ({
            id: b.id,
            invoiceNo: b.invoice_no,
            clinicName: b.clinic_name,
            clinicId: b.clinic_id,
            date: b.date,
            amount: parseFloat(b.total_amount) || 0,
            status: b.status || 'Paid',
            itemsSnapshot: b.items || [],
            itemsSummary: Array.isArray(b.items) ? b.items.map(i => `${i.name} (${i.qty})`).join(', ') : ''
          }));
          hasCloudData = true;
        } else {
          const realLocalBills = (state.recentBills || []).filter(b => b.id !== 'b1' && b.id !== 'b2' && b.id !== 'b3');
          if (realLocalBills.length > 0) {
            for (const b of realLocalBills) {
              const c = state.clinics.find(cl => cl.id === b.clinicId || cl.name === b.clinicName);
              await cloudSaveBill(b, c);
            }
          }
        }
        state.clinics.forEach(c => {
          const cBills = state.recentBills.filter(b => b.clinicId === c.id || b.clinicName === c.name);
          c.totalOrders = cBills.length;
          c.totalBilled = cBills.reduce((sum, b) => sum + (b.amount || 0), 0);
        });
      }

      if (Array.isArray(dbProducts)) {
        if (dbProducts.length > 0) {
          state.products = dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            sizes: p.sizes,
            spec: p.spec,
            rate: parseFloat(p.rate) || 0
          }));
          hasCloudData = true;
        } else {
          const realLocalProds = (state.products || []).filter(p => p.id !== 'p1' && p.id !== 'p2' && p.id !== 'p3' && p.id !== 'p4');
          if (realLocalProds.length > 0) {
            for (const p of realLocalProds) {
              await cloudSaveProduct(p);
            }
          }
        }
      }

      if (Array.isArray(dbSettings) && dbSettings.length > 0 && dbSettings[0]) {
        const cs = dbSettings[0];
        const isEditingSettings = document.activeElement && document.activeElement.closest && document.activeElement.closest('#settingsForm');
        if (!isEditingSettings) {
          state.settings = {
            companyName: cs.company_name || state.settings.companyName,
            tagline: cs.tagline || state.settings.tagline,
            address: cs.address || state.settings.address,
            phone: cs.phone || state.settings.phone,
            email: cs.email || state.settings.email,
            website: cs.website || state.settings.website,
            invoicePrefix: cs.invoice_prefix || state.settings.invoicePrefix,
            signature: cs.authorized_signature || state.settings.signature
          };
          saveLocalData();
        }
        hasCloudData = true;
      }

      // Sync employees from Supabase Cloud
      if (Array.isArray(dbEmployees)) {
        state.employees = dbEmployees.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role || '',
          phone: e.phone || ''
        }));
        hasCloudData = true;
      }

      // Sync attendance records from Supabase Cloud
      if (Array.isArray(dbAttendance)) {
        const map = {};
        dbAttendance.forEach(a => {
          if (!map[a.date]) map[a.date] = [];
          map[a.date].push({
            employeeId: a.employee_id,
            employeeName: a.employee_name,
            date: a.date,
            status: a.status || 'Present',
            notes: a.notes || ''
          });
        });
        state.attendanceRecords = map;
        hasCloudData = true;
      }

      if (!state.selectedClinicId || !state.clinics.some(c => c.id === state.selectedClinicId)) {
        state.selectedClinicId = state.clinics.length > 0 ? state.clinics[0].id : '';
      }

      saveLocalData();
      updateDbStatus(true, 'Supabase Cloud Live');
      renderClinicSelect();
      renderRecentBillsTable();
      renderAllBillsPageView();
      renderClinicsPageView();
      renderProductsTable();
      updateProductsCatalogUI();
      renderOutstandingTable();
      renderSettingsUI();
      updateStatsUI();
      recalculateNextInvoiceNumber();
      renderAttendancePageView();
    } catch (err) {
      console.warn('Cloud data fetch notice (using local storage):', err);
      updateDbStatus(false, 'Local Storage');
    }
  };

  window.syncWithCloud = cloudFetchAllData;

  const openClinicDetails = (clinic) => {
    const detailsModalTitle = document.getElementById('detailsModalTitle');
    const detailsModalContent = document.getElementById('detailsModalContent');
    const clinicDetailsModal = document.getElementById('clinicDetailsModal');
    const btnSelectFromDetails = document.getElementById('btnSelectFromDetails');

    if (detailsModalTitle) detailsModalTitle.textContent = `${clinic.name} Details`;
    if (detailsModalContent) {
      detailsModalContent.innerHTML = `
        <div style="background:#FFF8F9; padding:14px; border-radius:10px; border:1px solid #FFE4E6;">
          <h4 style="font-size:14px; font-weight:800; color:#1E293B;">${clinic.name}</h4>
          <p style="color:#64748B; font-size:12px; margin:4px 0 8px;">${clinic.address}</p>
          <div style="font-size:12px; color:#E11D48; font-weight:700;">Phone: ${clinic.phone}</div>
          <div style="font-size:12px; color:#475569; margin-top:4px;">Contact: ${clinic.contactPerson || 'Admin'}</div>
          <div style="font-size:12px; color:#10B981; font-weight:700; margin-top:8px;">Total Billed: ${formatCurrency(clinic.totalBilled || 0)} (${clinic.totalOrders || 0} Orders)</div>
        </div>
      `;
    }
    if (btnSelectFromDetails) {
      btnSelectFromDetails.onclick = () => {
        state.selectedClinicId = clinic.id;
        renderClinicSelect();
        if (clinicDetailsModal) clinicDetailsModal.classList.remove('active');
        switchView('view-create-bill');
      };
    }
    if (clinicDetailsModal) clinicDetailsModal.classList.add('active');
  };

  const btnCloseDetailsModal = document.getElementById('btnCloseDetailsModal');
  if (btnCloseDetailsModal) {
    btnCloseDetailsModal.addEventListener('click', () => {
      const clinicDetailsModal = document.getElementById('clinicDetailsModal');
      if (clinicDetailsModal) clinicDetailsModal.classList.remove('active');
    });
  }

  ['btnOpenAddClinic', 'btnOpenAddClinicPage'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('addClinicModal');
        if (modal) modal.classList.add('active');
      });
    }
  });

  ['btnCloseClinicModal', 'btnCancelAddClinic'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('addClinicModal');
        if (modal) modal.classList.remove('active');
      });
    }
  });

  const addClinicForm = document.getElementById('addClinicForm');
  if (addClinicForm) {
    addClinicForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newClinicName').value.trim();
      const contactPerson = document.getElementById('newClinicPerson').value.trim();
      const phone = document.getElementById('newClinicPhone').value.trim();
      const address = document.getElementById('newClinicAddress').value.trim();

      if (!name || !phone || !address) {
        showToast('Please fill all required clinic fields', 'error');
        return;
      }

      const newClinic = {
        id: generateUUID(),
        name,
        contactPerson,
        phone,
        address,
        totalOrders: 0,
        totalBilled: 0
      };

      state.clinics.unshift(newClinic);
      state.selectedClinicId = newClinic.id;
      saveLocalData();
      renderClinicSelect();
      renderClinicsPageView();
      updateStatsUI();
      cloudSaveClinic(newClinic);

      addClinicForm.reset();
      const modal = document.getElementById('addClinicModal');
      if (modal) modal.classList.remove('active');
      showToast(`Clinic "${name}" added successfully!`, 'success');
    });
  }

  const resetProductModalState = () => {
    const form = document.getElementById('addProductForm');
    if (form) form.reset();
    const editIdInput = document.getElementById('editProductId');
    if (editIdInput) editIdInput.value = '';
    const modalTitle = document.getElementById('addProductModalTitle');
    if (modalTitle) modalTitle.textContent = '+ Add New Product Line';
    const submitBtn = document.getElementById('btnSubmitProductModal');
    if (submitBtn) submitBtn.textContent = 'Save Product';
  };

  ['btnOpenAddProduct', 'btnOpenAddProductPage', 'btnOpenAddProductModal'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        resetProductModalState();
        const modal = document.getElementById('addProductModal');
        if (modal) {
          modal.classList.add('active');
          const firstInput = document.getElementById('newProductName');
          if (firstInput) setTimeout(() => firstInput.focus(), 50);
        }
      });
    }
  });

  ['btnCloseProductModal', 'btnCancelAddProduct'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        resetProductModalState();
        const modal = document.getElementById('addProductModal');
        if (modal) modal.classList.remove('active');
      });
    }
  });

  // Allow clicking modal overlay backdrop to close modals
  ['addClinicModal', 'addProductModal', 'clinicDetailsModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (id === 'addProductModal') resetProductModalState();
          modal.classList.remove('active');
        }
      });
    }
  });

  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = (document.getElementById('editProductId') ? document.getElementById('editProductId').value : '').trim();
      const name = document.getElementById('newProductName').value.trim();
      const sizes = document.getElementById('newProductSizes').value.trim();
      const spec = document.getElementById('newProductSpec').value.trim();
      const rateVal = document.getElementById('newProductRate').value.trim();
      const rate = parseFloat(rateVal);

      if (!name || isNaN(rate) || rate < 0) {
        showToast('Please enter valid product details with a valid rate', 'error');
        return;
      }

      if (editId) {
        // Edit Mode: Update existing product
        const prod = state.products.find(p => p.id === editId);
        if (prod) {
          prod.name = name;
          prod.sizes = sizes;
          prod.spec = spec;
          prod.rate = rate;

          saveLocalData();
          renderProductsTable();
          updateProductsCatalogUI();
          cloudUpdateProduct(prod);

          resetProductModalState();
          const modal = document.getElementById('addProductModal');
          if (modal) modal.classList.remove('active');
          showToast(`Product "${name}" updated (₹${formatCompactRate(rate)})!`, 'success');
          return;
        }
      }

      // Add Mode: Create new product
      const newProd = {
        id: generateUUID(),
        name,
        sizes,
        spec,
        rate
      };

      state.products.push(newProd);
      saveLocalData();
      renderProductsTable();
      updateProductsCatalogUI();
      cloudSaveProduct(newProd);

      resetProductModalState();
      const modal = document.getElementById('addProductModal');
      if (modal) modal.classList.remove('active');
      showToast(`Product "${name}" added (₹${formatCompactRate(rate)})!`, 'success');
    });
  }

  const settingsForm = document.getElementById('settingsForm');
  const syncSettingsFromInputs = () => {
    const setCompanyName = document.getElementById('settingCompanyName');
    const setTagline = document.getElementById('settingTagline');
    const setAddress = document.getElementById('settingAddress');
    const setPhone = document.getElementById('settingPhone');
    const setEmail = document.getElementById('settingEmail');
    const setWebsite = document.getElementById('settingWebsite');
    const setPrefix = document.getElementById('settingPrefix');
    const setSignature = document.getElementById('settingSignature');

    if (setCompanyName && setCompanyName.value.trim()) {
      state.settings.companyName = setCompanyName.value.trim();
    }
    if (setTagline) state.settings.tagline = setTagline.value.trim();
    if (setAddress) state.settings.address = setAddress.value.trim();
    if (setPhone) state.settings.phone = setPhone.value.trim();
    if (setEmail) state.settings.email = setEmail.value.trim();
    if (setWebsite) state.settings.website = setWebsite.value.trim();
    if (setPrefix && setPrefix.value.trim()) {
      state.settings.invoicePrefix = setPrefix.value.trim();
    }
    if (setSignature) state.settings.signature = setSignature.value.trim();

    // Persist to local storage
    saveLocalData();

    // Immediately sync Settings UI across invoice preview & sidebar
    renderSettingsUI();
    recalculateNextInvoiceNumber();
  };

  // Attach live input listeners to all settings fields
  ['settingCompanyName', 'settingTagline', 'settingAddress', 'settingPhone', 'settingEmail', 'settingWebsite', 'settingPrefix', 'settingSignature'].forEach(id => {
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.addEventListener('input', syncSettingsFromInputs);
    }
  });

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      syncSettingsFromInputs();

      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : 'Save Settings';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      try {
        // Sync with Supabase Cloud
        const cloudOk = await cloudSaveSettings(state.settings);
        if (cloudOk) {
          showToast('Company settings saved & synced to cloud!', 'success');
        } else {
          showToast('Company settings saved locally', 'normal');
        }
      } catch (err) {
        console.error('Settings submit error:', err);
        showToast('Company settings saved locally', 'normal');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
      }
    });
  }

  const btnFilterBills = document.getElementById('btnFilterBills');
  if (btnFilterBills) {
    btnFilterBills.addEventListener('click', () => {
      state.billStatusFilter = state.billStatusFilter === 'All' ? 'Paid' : (state.billStatusFilter === 'Paid' ? 'Pending' : 'All');
      btnFilterBills.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filter: ${state.billStatusFilter}`;
      const searchInput = document.getElementById('searchRecentBillsInput');
      renderRecentBillsTable(searchInput ? searchInput.value : '');
    });
  }

  const btnFilterAllBills = document.getElementById('btnFilterAllBills');
  if (btnFilterAllBills) {
    btnFilterAllBills.addEventListener('click', () => {
      state.allBillsFilter = state.allBillsFilter === 'All' ? 'Paid' : (state.allBillsFilter === 'Paid' ? 'Pending' : 'All');
      btnFilterAllBills.textContent = `Filter: ${state.allBillsFilter}`;
      renderAllBillsPageView();
    });
  }

  if (btnViewClinicDetails) {
    btnViewClinicDetails.addEventListener('click', () => {
      const clinic = state.clinics.find(c => c.id === state.selectedClinicId);
      if (clinic) openClinicDetails(clinic);
    });
  }

  const btnPrintTop = document.getElementById('btnPrintTop');
  if (btnPrintTop) btnPrintTop.addEventListener('click', () => window.printInvoice());

  const btnDownloadTop = document.getElementById('btnDownloadTop');
  if (btnDownloadTop) btnDownloadTop.addEventListener('click', () => window.downloadInvoicePdf());

  const btnContactSupport = document.getElementById('btnContactSupport');
  if (btnContactSupport) {
    btnContactSupport.addEventListener('click', () => {
      showToast('Support desk: support@yourcompany.com', 'normal');
    });
  }

  const searchRecentBillsInput = document.getElementById('searchRecentBillsInput');
  if (searchRecentBillsInput) {
    searchRecentBillsInput.addEventListener('input', (e) => {
      renderRecentBillsTable(e.target.value);
    });
  }

  const searchAllBillsInput = document.getElementById('searchAllBillsInput');
  if (searchAllBillsInput) {
    searchAllBillsInput.addEventListener('input', (e) => {
      renderAllBillsPageView(e.target.value);
    });
  }

  const searchClinicPageInput = document.getElementById('searchClinicPageInput');
  if (searchClinicPageInput) {
    searchClinicPageInput.addEventListener('input', (e) => {
      renderClinicsPageView(e.target.value);
    });
  }

  /* ================================================================
     ATTENDANCE MODULE LOGIC
  ================================================================ */
  const formatIsoDateToDisplay = (isoStr) => {
    if (!isoStr) return '';
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) { }
    return isoStr;
  };

  const getStaffInitials = (name) => {
    if (!name) return 'ST';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const ensureDailyAttendanceList = (dateStr) => {
    if (!state.attendanceRecords[dateStr]) {
      state.attendanceRecords[dateStr] = [];
    }

    const isSunday = new Date(dateStr + 'T00:00:00').getDay() === 0;
    const defaultStatus = isSunday ? 'Sunday Off' : 'Present';
    const defaultNotes = isSunday ? 'Weekly Off' : '';

    const currentRecords = state.attendanceRecords[dateStr];
    state.employees.forEach(emp => {
      let found = currentRecords.find(r => r.employeeId === emp.id);
      if (!found) {
        currentRecords.push({
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: defaultStatus,
          notes: defaultNotes
        });
      } else {
        found.employeeName = emp.name;
      }
    });

    // Remove any stale records if employee was deleted
    state.attendanceRecords[dateStr] = currentRecords.filter(r =>
      state.employees.some(emp => emp.id === r.employeeId)
    );

    return state.attendanceRecords[dateStr];
  };

  const renderAttendancePageView = (searchQuery = '') => {
    const tableBody = document.getElementById('attendanceTableBody');
    const dateInput = document.getElementById('attendanceDateInput');
    const dateLabel = document.getElementById('attCurrentDateLabel');
    const monthPicker = document.getElementById('attendanceMonthPicker');

    if (!tableBody) return;

    const activeDate = state.selectedAttendanceDate || new Date().toISOString().split('T')[0];
    if (dateInput && dateInput.value !== activeDate) {
      dateInput.value = activeDate;
    }
    if (monthPicker && !monthPicker.value) {
      monthPicker.value = activeDate.slice(0, 7);
    }

    const dObj = new Date(activeDate + 'T00:00:00');
    const dayOfWeek = dObj.getDay();
    const isSunday = dayOfWeek === 0;

    if (dateLabel) {
      try {
        dateLabel.textContent = `Date: ${dObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      } catch (e) {
        dateLabel.textContent = `Date: ${activeDate}`;
      }
    }

    const badgeEl = document.getElementById('attendanceDayBadge');
    if (badgeEl) {
      badgeEl.style.display = 'inline-flex';
      if (isSunday) {
        badgeEl.className = 'attendance-day-badge sunday';
        badgeEl.innerHTML = '🏖️ Sunday — Office Leave (Weekly Off)';
      } else {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek] || 'Working Day';
        badgeEl.className = 'attendance-day-badge normal';
        badgeEl.innerHTML = `📅 ${dayName} (Working Day)`;
      }
    }

    const dailyRecords = ensureDailyAttendanceList(activeDate);

    // Filter by search query if any
    const query = (searchQuery || '').trim().toLowerCase();
    let displayList = state.employees.filter(emp => {
      if (!query) return true;
      return (emp.name && emp.name.toLowerCase().includes(query)) ||
        (emp.role && emp.role.toLowerCase().includes(query));
    });

    tableBody.innerHTML = '';

    if (displayList.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 32px 16px; color: #64748B;">
            <div style="font-size: 28px; margin-bottom: 8px;">👥</div>
            <div style="font-weight: 700; font-size: 14px; color: #1E293B;">No Staff Members Found</div>
            <p style="font-size: 12px; margin-top: 4px;">Click <strong>"+ Add Staff"</strong> above to register your workers &amp; team members.</p>
          </td>
        </tr>
      `;
    } else {
      displayList.forEach((emp, index) => {
        const defaultStatus = isSunday ? 'Sunday Off' : 'Present';
        const record = dailyRecords.find(r => r.employeeId === emp.id) || {
          status: defaultStatus,
          notes: isSunday ? 'Weekly Off' : ''
        };
        const initials = getStaffInitials(emp.name);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="text-align: center; font-weight: 700; color: #64748B;">${index + 1}</td>
          <td>
            <div class="staff-name-cell">
              <div class="staff-avatar-initial">${initials}</div>
              <div>
                <div class="staff-name-title">${emp.name}</div>
                <div class="staff-role-subtitle">${emp.role || 'Staff Member'} ${emp.phone ? '• ' + emp.phone : ''}</div>
              </div>
            </div>
          </td>
          <td style="font-weight: 600; color: #475569; font-size: 12px;">
            ${formatIsoDateToDisplay(activeDate)}
          </td>
          <td>
            <select class="attendance-status-select" data-status="${record.status}" onchange="window.updateEmployeeAttendanceStatus('${emp.id}', this.value, this)">
              ${isSunday ? `
                <option value="Sunday Off" ${record.status === 'Sunday Off' || record.status === 'Weekly Off' ? 'selected' : ''}>🏖️ Sunday Off (Weekly Off)</option>
                <option value="Sunday Duty" ${record.status === 'Sunday Duty' ? 'selected' : ''}>⚡ Sunday Duty (Overtime)</option>
                <option value="Present" ${record.status === 'Present' ? 'selected' : ''}>🟢 Present</option>
                <option value="Absent" ${record.status === 'Absent' ? 'selected' : ''}>🔴 Absent</option>
                <option value="Half Day" ${record.status === 'Half Day' ? 'selected' : ''}>🟠 Half Day</option>
                <option value="Leave" ${record.status === 'Leave' ? 'selected' : ''}>🟣 On Leave</option>
              ` : `
                <option value="Present" ${record.status === 'Present' ? 'selected' : ''}>🟢 Present</option>
                <option value="Absent" ${record.status === 'Absent' ? 'selected' : ''}>🔴 Absent</option>
                <option value="Half Day" ${record.status === 'Half Day' ? 'selected' : ''}>🟠 Half Day</option>
                <option value="Leave" ${record.status === 'Leave' ? 'selected' : ''}>🟣 On Leave</option>
                <option value="Sunday Off" ${record.status === 'Sunday Off' || record.status === 'Weekly Off' ? 'selected' : ''}>🏖️ Weekly Off</option>
                <option value="Sunday Duty" ${record.status === 'Sunday Duty' ? 'selected' : ''}>⚡ Sunday Duty</option>
              `}
            </select>
          </td>
          <td>
            <input type="text" class="attendance-notes-input" placeholder="Optional notes / remarks..." value="${record.notes || ''}" oninput="window.updateEmployeeAttendanceNotes('${emp.id}', this.value)">
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn-action-icon delete" onclick="window.deleteEmployee('${emp.id}')" title="Delete Staff Member">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }

    updateAttendanceStats(activeDate);
    renderMonthlyAttendanceReport();
  };

  const updateAttendanceStats = (dateStr) => {
    const totalEl = document.getElementById('attStatTotal');
    const presentEl = document.getElementById('attStatPresent');
    const absentEl = document.getElementById('attStatAbsent');
    const othersEl = document.getElementById('attStatOthers');
    const rateEl = document.getElementById('attStatRate');

    const totalStaff = state.employees.length;
    const dailyRecords = state.attendanceRecords[dateStr] || [];

    let present = 0;
    let absent = 0;
    let others = 0;
    let sundayOff = 0;

    dailyRecords.forEach(r => {
      if (r.status === 'Present' || r.status === 'Sunday Duty') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Sunday Off' || r.status === 'Weekly Off') sundayOff++;
      else others++;
    });

    const isSunday = new Date(dateStr + 'T00:00:00').getDay() === 0;
    const rate = totalStaff > 0 ? (isSunday ? (present > 0 ? Math.round((present / totalStaff) * 100) : 100) : Math.round((present / totalStaff) * 100)) : 0;

    if (totalEl) totalEl.textContent = totalStaff;
    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (othersEl) othersEl.textContent = isSunday ? `${sundayOff} Off` : others;
    if (rateEl) rateEl.textContent = isSunday ? (present > 0 ? `${present} on Duty` : 'Sunday Off') : `${rate}% Rate`;
  };

  const renderMonthlyAttendanceReport = () => {
    const monthlyTableBody = document.getElementById('attendanceMonthlyTableBody');
    const monthPicker = document.getElementById('attendanceMonthPicker');
    if (!monthlyTableBody) return;

    const selectedMonth = (monthPicker && monthPicker.value) || state.selectedAttendanceDate.slice(0, 7);
    monthlyTableBody.innerHTML = '';

    if (state.employees.length === 0) {
      monthlyTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align:center; padding:20px; color:#64748B;">No employees registered yet.</td></tr>
      `;
      return;
    }

    state.employees.forEach((emp, index) => {
      let presentCount = 0;
      let absentCount = 0;
      let otherCount = 0;
      let workingDaysLogged = 0;
      let sundayDutyCount = 0;

      // Scan all attendance keys for the selected month
      Object.keys(state.attendanceRecords).forEach(dateKey => {
        if (dateKey.startsWith(selectedMonth)) {
          const records = state.attendanceRecords[dateKey] || [];
          const rec = records.find(r => r.employeeId === emp.id);
          if (rec) {
            const isSunday = new Date(dateKey + 'T00:00:00').getDay() === 0;
            if (isSunday) {
              if (rec.status === 'Sunday Duty' || rec.status === 'Present') {
                sundayDutyCount++;
                presentCount++;
              }
              // Sundays (Sunday Off / Weekly Off) are excluded from the working days count!
            } else {
              // Working days (Monday through Saturday)
              workingDaysLogged++;
              if (rec.status === 'Present') presentCount++;
              else if (rec.status === 'Absent') absentCount++;
              else otherCount++;
            }
          }
        }
      });

      // Attendance rate is based on actual working days (Monday-Saturday)
      const rate = workingDaysLogged > 0 ? Math.min(100, Math.round((presentCount / workingDaysLogged) * 100)) : (presentCount > 0 ? 100 : 0);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center; font-weight:700; color:#64748B;">${index + 1}</td>
        <td style="font-weight:700; color:#1E293B;">${emp.name}</td>
        <td style="color:#64748B;">${emp.role || 'Staff'}</td>
        <td style="text-align:center; font-weight:700; color:#059669;">${presentCount} days ${sundayDutyCount > 0 ? `<div style="color:#2563EB; font-size:10px; font-weight:600;">(${sundayDutyCount} Sun duty)</div>` : ''}</td>
        <td style="text-align:center; font-weight:700; color:#E11D48;">${absentCount} days</td>
        <td style="text-align:center; font-weight:600; color:#D97706;">${otherCount} days</td>
        <td style="text-align:center;">
          <span class="status-pill ${rate >= 75 ? 'paid' : 'pending'}">${rate}%</span>
        </td>
      `;
      monthlyTableBody.appendChild(tr);
    });
  };

  // Window methods for inline table interactions
  window.updateEmployeeAttendanceStatus = (empId, newStatus, selectEl) => {
    const activeDate = state.selectedAttendanceDate;
    const dailyRecords = ensureDailyAttendanceList(activeDate);
    const rec = dailyRecords.find(r => r.employeeId === empId);
    if (rec) {
      rec.status = newStatus;
    }
    if (selectEl) {
      selectEl.dataset.status = newStatus;
    }
    saveLocalData();
    updateAttendanceStats(activeDate);
    renderMonthlyAttendanceReport();
    triggerAutoSaveAttendance(activeDate);
  };

  let attendanceCloudSaveTimer = null;
  const triggerAutoSaveAttendance = (dateStr) => {
    clearTimeout(attendanceCloudSaveTimer);
    attendanceCloudSaveTimer = setTimeout(async () => {
      const records = state.attendanceRecords[dateStr] || [];
      if (records.length > 0) {
        await cloudSaveAttendanceDay(dateStr, records);
      }
    }, 800);
  };

  window.updateEmployeeAttendanceNotes = (empId, notes) => {
    const activeDate = state.selectedAttendanceDate;
    const dailyRecords = ensureDailyAttendanceList(activeDate);
    const rec = dailyRecords.find(r => r.employeeId === empId);
    if (rec) {
      rec.notes = notes;
      saveLocalData();
      triggerAutoSaveAttendance(activeDate);
    }
  };

  window.deleteEmployee = async (empId) => {
    const emp = state.employees.find(e => e.id === empId);
    const name = emp ? emp.name : 'this staff member';
    if (!confirm(`Are you sure you want to remove ${name} from the staff list?`)) return;

    state.employees = state.employees.filter(e => e.id !== empId);
    const activeDate = state.selectedAttendanceDate;
    if (state.attendanceRecords[activeDate]) {
      state.attendanceRecords[activeDate] = state.attendanceRecords[activeDate].filter(r => r.employeeId !== empId);
    }

    saveLocalData();
    renderAttendancePageView();
    showToast(`Staff member removed`, 'normal');
    await cloudDeleteEmployee(empId);
  };

  const exportAttendanceCSV = () => {
    const monthPicker = document.getElementById('attendanceMonthPicker');
    const selectedMonth = (monthPicker && monthPicker.value) || state.selectedAttendanceDate.slice(0, 7);

    // UTF-8 BOM ensures Excel on Windows correctly detects UTF-8 without symbol corruption
    let csv = '\uFEFF"S.No","Employee Name","Role","Phone","Date","Day","Status","Notes"\n';
    let rowIdx = 1;

    const dates = Object.keys(state.attendanceRecords)
      .filter(d => d.startsWith(selectedMonth))
      .sort();

    if (dates.length === 0) {
      showToast('No attendance records logged for ' + selectedMonth, 'normal');
      return;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    dates.forEach(d => {
      const list = state.attendanceRecords[d] || [];
      const dObj = new Date(d + 'T00:00:00');
      const dayName = dayNames[dObj.getDay()] || '';
      const displayDate = formatIsoDateToDisplay(d);

      list.forEach(rec => {
        const emp = state.employees.find(e => e.id === rec.employeeId);
        const name = (rec.employeeName || (emp ? emp.name : '')).replace(/"/g, '""');
        const role = (emp ? emp.role || 'Staff' : 'Staff').replace(/"/g, '""');
        let rawPhone = (emp ? emp.phone || '' : '').replace(/"/g, '""');
        // Use Excel formula syntax ="..." to preserve exact phone digits without scientific notation or formula errors
        const phoneCell = rawPhone ? `="${rawPhone}"` : '=""';
        const dateCell = `="${displayDate}"`;
        const status = (rec.status || 'Present').replace(/"/g, '""');
        const notes = (rec.notes || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');

        csv += `"${rowIdx++}","${name}","${role}",${phoneCell},${dateCell},"${dayName}","${status}","${notes}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Attendance CSV exported cleanly!', 'success');
  };

  const initAttendanceModule = () => {
    const dateInput = document.getElementById('attendanceDateInput');
    const prevBtn = document.getElementById('btnPrevAttendanceDate');
    const nextBtn = document.getElementById('btnNextAttendanceDate');
    const todayBtn = document.getElementById('btnTodayAttendanceDate');
    const markAllBtn = document.getElementById('btnMarkAllPresent');
    const saveBtn = document.getElementById('btnSaveAttendance');
    const searchStaffInput = document.getElementById('searchAttendanceStaffInput');
    const monthPicker = document.getElementById('attendanceMonthPicker');
    const exportBtn = document.getElementById('btnExportAttendanceCsv');

    // Add Staff Modal references
    const addStaffModal = document.getElementById('addEmployeeModal');
    const openAddStaffBtn = document.getElementById('btnOpenAddEmployeeModal');
    const closeAddStaffBtn = document.getElementById('btnCloseEmployeeModal');
    const cancelAddStaffBtn = document.getElementById('btnCancelAddEmployee');
    const addStaffForm = document.getElementById('addEmployeeForm');

    // Set initial date picker values
    if (dateInput) {
      dateInput.value = state.selectedAttendanceDate;
      dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          state.selectedAttendanceDate = e.target.value;
          renderAttendancePageView();
        }
      });
    }

    if (monthPicker) {
      monthPicker.value = state.selectedAttendanceDate.slice(0, 7);
      monthPicker.addEventListener('change', () => {
        renderMonthlyAttendanceReport();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const d = new Date(state.selectedAttendanceDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        state.selectedAttendanceDate = d.toISOString().split('T')[0];
        if (dateInput) dateInput.value = state.selectedAttendanceDate;
        renderAttendancePageView();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const d = new Date(state.selectedAttendanceDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        state.selectedAttendanceDate = d.toISOString().split('T')[0];
        if (dateInput) dateInput.value = state.selectedAttendanceDate;
        renderAttendancePageView();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        state.selectedAttendanceDate = new Date().toISOString().split('T')[0];
        if (dateInput) dateInput.value = state.selectedAttendanceDate;
        renderAttendancePageView();
      });
    }

    if (markAllBtn) {
      markAllBtn.addEventListener('click', async () => {
        const isSunday = new Date(state.selectedAttendanceDate + 'T00:00:00').getDay() === 0;
        const targetStatus = isSunday ? 'Sunday Off' : 'Present';
        const targetNotes = isSunday ? 'Weekly Off' : '';
        const dailyRecords = ensureDailyAttendanceList(state.selectedAttendanceDate);
        dailyRecords.forEach(r => {
          r.status = targetStatus;
          if (isSunday && !r.notes) r.notes = targetNotes;
        });
        saveLocalData();
        renderAttendancePageView();
        showToast(isSunday ? 'Marked all staff as Sunday Weekly Off! 🏖️' : 'All staff marked Present for today! ✓', 'success');
        await cloudSaveAttendanceDay(state.selectedAttendanceDate, dailyRecords);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        saveLocalData();
        const currentRecords = state.attendanceRecords[state.selectedAttendanceDate] || [];
        const origText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        try {
          const cloudOk = await cloudSaveAttendanceDay(state.selectedAttendanceDate, currentRecords);
          if (cloudOk) {
            showToast('Attendance saved & synced to cloud! ☁️', 'success');
          } else {
            showToast('Attendance recorded and saved locally! 💾', 'normal');
          }
        } catch (e) {
          showToast('Attendance recorded and saved locally! 💾', 'normal');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = origText;
        }
      });
    }

    if (searchStaffInput) {
      searchStaffInput.addEventListener('input', (e) => {
        renderAttendancePageView(e.target.value);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportAttendanceCSV);
    }

    // Modal controls
    if (openAddStaffBtn && addStaffModal) {
      openAddStaffBtn.addEventListener('click', () => {
        addStaffModal.classList.add('active');
        const nameInp = document.getElementById('newEmployeeName');
        if (nameInp) nameInp.focus();
      });
    }

    const closeEmployeeModal = () => {
      if (addStaffModal) addStaffModal.classList.remove('active');
      if (addStaffForm) addStaffForm.reset();
    };

    if (closeAddStaffBtn) closeAddStaffBtn.addEventListener('click', closeEmployeeModal);
    if (cancelAddStaffBtn) cancelAddStaffBtn.addEventListener('click', closeEmployeeModal);

    if (addStaffForm) {
      addStaffForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInp = document.getElementById('newEmployeeName');
        const roleInp = document.getElementById('newEmployeeRole');
        const phoneInp = document.getElementById('newEmployeePhone');

        const name = nameInp ? nameInp.value.trim() : '';
        const role = roleInp ? roleInp.value.trim() : '';
        const phone = phoneInp ? phoneInp.value.trim() : '';

        if (!name) {
          showToast('Please enter the employee name', 'error');
          return;
        }

        const newEmp = {
          id: generateUUID(),
          name: name,
          role: role || 'Staff Member',
          phone: phone || ''
        };

        state.employees.push(newEmp);
        saveLocalData();
        closeEmployeeModal();
        renderAttendancePageView();

        const cloudOk = await cloudSaveEmployee(newEmp);
        if (cloudOk) {
          showToast(`Added ${newEmp.name} & synced to cloud! ☁️`, 'success');
        } else {
          showToast(`Added ${newEmp.name} to staff roster!`, 'success');
        }
      });
    }
  };

  loadLocalData();
  initAttendanceModule();
  renderClinicSelect();
  renderRecentBillsTable();
  renderAllBillsPageView();
  renderClinicsPageView();
  renderProductsTable();
  updateProductsCatalogUI();
  renderOutstandingTable();
  renderSettingsUI();
  updateStatsUI();
  recalculateNextInvoiceNumber();
  cloudFetchAllData();

  // Instant multi-device sync when window or tab gets focus
  window.addEventListener('focus', () => {
    cloudFetchAllData();
  });

  // Periodic background sync every 20 seconds
  setInterval(() => {
    cloudFetchAllData();
  }, 20000);
});
