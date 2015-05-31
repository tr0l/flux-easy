function LoginStore() {
    type $StateType = {logged_user: string}
    var $dependents, $instance, $dispatchTokens, $state: $StateType;

    return {
        createStoreReference: function createStoreReference(dispatcher) {
            if (!$instance)
                createStoreInstance(dispatcher);

            var ref = {
                _onLoggedIn: [],

                addLoggedInListenner: function(listenner) {
                    ret._onLoggedIn.push(listenner);
                },

                removeLoggedInListenner: function(listenner) {
                    var i = ret._onLoggedIn.indexOf(listenner);

                    if (i >= 0)
                        ret._onLoggedIn.splice(i, 1);
                },

                _onLoginError: [],

                addLoginErrorListenner: function(listenner) {
                    ret._onLoginError.push(listenner);
                },

                removeLoginErrorListenner: function(listenner) {
                    var i = ret._onLoginError.indexOf(listenner);

                    if (i >= 0)
                        ret._onLoginError.splice(i, 1);
                },

                _onLoggedOut: [],

                addLoggedOutListenner: function(listenner) {
                    ret._onLoggedOut.push(listenner);
                },

                removeLoggedOutListenner: function(listenner) {
                    var i = ret._onLoggedOut.indexOf(listenner);

                    if (i >= 0)
                        ret._onLoggedOut.splice(i, 1);
                },

                releaseStoreReference: function releaseStoreReference() {
                    if ($dependents.length == 1 && $dependents[0] == ref)
                        destroyStoreInstance();
                    else {
                        var i = $dependents.indexOf(ref);
                        $dependents.splice(i, 1);
                    }
                },

                getState: function() {
                    return $state;
                },

                dispatchToken: $dispatchTokens,
                getLoggedUser: $instance.getLoggedUser.bind($instance),

                checkWindowLocationHash: function checkWindowLocationHash_dispatch() {
                    dispatcher.dispatch({
                        action: "LoginStore_checkWindowLocationHash"
                    });
                },

                login: function login_dispatch(name, password) {
                    dispatcher.dispatch({
                        action: "LoginStore_login",
                        arg_name: name,
                        arg_password: password
                    });
                },

                logout: function logout_dispatch() {
                    dispatcher.dispatch({
                        action: "LoginStore_logout"
                    });
                }
            };

            $dependents.push(ref);
            return ref;
        }
    };

    function createStoreInstance(dispatcher) {
        $dependents = [];

        $instance = {
            getInitialState: function getInitialState() {
                var state = {
                    logged_user: null
                };

                this.checkWindowLocationHash();
                return state;
            },

            getLoggedUser: function() {
                return $state.logged_user;
            },

            checkWindowLocationHash: function() {
                if (window.location.hash) {
                    $state.logged_user = window.location.hash;
                    $dependents.forEach(function(r) {
                        r._onLoggedIn.forEach($emitter);
                    });;
                }
            },

            login: function(name, password) {
                if (name == 'fluxeasy' && password == '123') {
                    $state.logged_user = 'fluxeasy';
                    $dependents.forEach(function($ref) {
                        $ref._onLoggedIn.forEach(function($event) {
                            $emitter($event, {
                                name: name
                            });
                        });
                    });;
                } else
                    $dependents.forEach(function(r) {
                        r._onLoginError.forEach($emitter);
                    });;
            },

            logout: function() {
                $state.logged_user = null;
                $dependents.forEach(function(r) {
                    r._onLoggedOut.forEach($emitter);
                });;
            }
        };

        $state = $instance.getInitialState();

        $dispatchTokens = {
            checkWindowLocationHash: dispatcher.register(function(payload) {
                if (payload.action === "LoginStore_checkWindowLocationHash")
                    $instance.checkWindowLocationHash.call($instance);
            }),

            login: dispatcher.register(function(payload) {
                if (payload.action === "LoginStore_login")
                    $instance.login.call($instance, payload.arg_name, payload.arg_password);
            }),

            logout: dispatcher.register(function(payload) {
                if (payload.action === "LoginStore_logout")
                    $instance.logout.call($instance);
            })
        };

        if (dispatcher.emitter)
            $emitter = dispatcher.emmiter;
        else $emitter = function(fn, e) {
            fn(e);
        };
    }

    function destroyStoreInstance(dispatcher) {
        dispatcher.unregister($dispatchToken);
        delete $instance;
        delete $dependents;
        delete $state;
        delete $dispatchToken;
        delete $emitter;
    }
}
