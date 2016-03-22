<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new Knp\Bundle\MenuBundle\KnpMenuBundle(),
            new FOS\JsRoutingBundle\FOSJsRoutingBundle(),
            new JMS\SerializerBundle\JMSSerializerBundle(),

            new Synergize\Bundle\DbalBundle\SynergizeDbalBundle(),
            new Computech\Bundle\CommonBundle\ComputechCommonBundle(),
            new Scheduler\Bundle\CommonBundle\SchedulerCommonBundle(),

            new BusinessMan\Bundle\BusinessManBundle\BusinessManBusinessManBundle(),
            new BusinessMan\Bundle\StaffBundle\BusinessManStaffBundle(),
            new BusinessMan\Bundle\ClientBundle\BusinessManClientBundle(),
            new BusinessMan\Bundle\JobBundle\BusinessManJobBundle(),
            new BusinessMan\Bundle\ProjectBundle\BusinessManProjectBundle(),
            new BusinessMan\Bundle\SupplierBundle\BusinessManSupplierBundle(),
            new BusinessMan\Bundle\PurchaseOrderBundle\BusinessManPurchaseOrderBundle(),
            new BusinessMan\Bundle\SupportBundle\BusinessManSupportBundle(),
            new BusinessMan\Bundle\SchedulerBundle\BusinessManSchedulerBundle(),
            new BusinessMan\Bundle\WebmailBundle\BusinessManWebmailBundle(),
            new BusinessMan\Bundle\CallBundle\BusinessManCallBundle(),
            new BusinessMan\Bundle\TaskBundle\BusinessManTaskBundle(),
            new BusinessMan\Bundle\QuoteBundle\BusinessManQuoteBundle(),
            new Mirsa\Bundle\MirsaBundle\MirsaMirsaBundle(),
        );

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
    }
}
