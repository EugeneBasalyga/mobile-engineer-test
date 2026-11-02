package com.reactnativetemplate

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import android.view.WindowManager;
import android.content.res.Configuration;
import android.content.Context;
import android.util.DisplayMetrics;

class MainApplication : Application(), ReactApplication {
    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList =
                        PackageList(this).packages.apply {
                            // Packages that cannot be autolinked yet can be added manually here, for example:
                            // add(MyReactNativePackage())
                        },
        )
    }

    override fun onCreate() {
        super.onCreate()
        adjustFontScale(applicationContext, resources.configuration)
        loadReactNative(this)
    }

    fun adjustFontScale(context: Context, configuration: Configuration) {
        if (configuration.fontScale != 1f) {
            configuration.fontScale = 1f
            val metrics: DisplayMetrics = context.resources.displayMetrics
            val wm: WindowManager = context.getSystemService(WINDOW_SERVICE) as WindowManager
            wm.getDefaultDisplay().getMetrics(metrics)
            metrics.scaledDensity = configuration.fontScale * metrics.density
            context.resources.updateConfiguration(configuration, metrics)
        }
    }
}
